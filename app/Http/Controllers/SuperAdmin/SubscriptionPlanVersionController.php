<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Actions\SuperAdmin\Subscriptions\PublishSubscriptionPlanVersion;
use App\Actions\SuperAdmin\Subscriptions\RecordSubscriptionPlanEvent;
use App\Actions\SuperAdmin\Subscriptions\ValidateSubscriptionPlanVersion;
use App\Enums\SubscriptionPlanVersionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\UpdateSubscriptionPlanVersionRequest;
use App\Models\OrganizationSubscription;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanVersion;
use App\Models\User;
use App\Support\SubscriptionPlanCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionPlanVersionController extends Controller
{
    public function show(SubscriptionPlan $plan, SubscriptionPlanVersion $version): Response
    {
        $this->authorizeVersion($plan, $version);
        $version->loadCount('subscriptions');

        return Inertia::render('super-admin/subscriptions/plan-version-show', [
            'plan' => ['id' => $plan->id, 'name' => $plan->name, 'code' => $plan->code, 'family' => $plan->family],
            'version' => $this->detail($version),
        ]);
    }

    public function edit(SubscriptionPlan $plan, SubscriptionPlanVersion $version): Response
    {
        $this->authorizeVersion($plan, $version);
        abort_unless($version->status === SubscriptionPlanVersionStatus::Draft, 403);

        return Inertia::render('super-admin/subscriptions/plan-form', [
            'plan' => ['id' => $plan->id, 'name' => $plan->name, 'code' => $plan->code, 'family' => $plan->family],
            'version' => $this->detail($version),
            'limitDefinitions' => SubscriptionPlanCatalog::LIMITS,
            'entitlementDefinitions' => SubscriptionPlanCatalog::ENTITLEMENTS,
            'billingCycles' => ['monthly', 'quarterly', 'annual', 'custom'],
            'supportTiers' => ['standard', 'priority', 'premium', 'custom'],
        ]);
    }

    public function update(UpdateSubscriptionPlanVersionRequest $request, SubscriptionPlan $plan, SubscriptionPlanVersion $version, RecordSubscriptionPlanEvent $events): RedirectResponse
    {
        $this->authorizeVersion($plan, $version);
        DB::transaction(function () use ($request, $plan, $version, $events): void {
            $locked = SubscriptionPlanVersion::query()->lockForUpdate()->findOrFail($version->id);
            if ($locked->status !== SubscriptionPlanVersionStatus::Draft || $locked->lock_version !== $request->integer('lock_version')) {
                throw ValidationException::withMessages(['lock_version' => 'This draft changed. Refresh and try again.']);
            }
            $locked->fill($request->safe()->except('lock_version'));
            $changed = array_keys($locked->getDirty());
            $locked->forceFill([
                'validation_results' => null,
                'validated_at' => null,
                'validator_version' => null,
                'lock_version' => $locked->lock_version + 1,
            ])->save();
            $events->handle($plan, $locked, $request->user(), 'subscription_plan_version.updated', 'draft', 'draft', $changed);
        });

        return to_route('super-admin.subscription-plan-versions.show', [$plan, $version])->with('success', 'Draft updated.');
    }

    public function validateVersion(Request $request, SubscriptionPlan $plan, SubscriptionPlanVersion $version, ValidateSubscriptionPlanVersion $validator, RecordSubscriptionPlanEvent $events): RedirectResponse
    {
        $this->authorizeVersion($plan, $version);
        abort_unless($version->status === SubscriptionPlanVersionStatus::Draft, 403);
        $results = $validator->handle($version);
        $version->forceFill([
            'validation_results' => $results,
            'validated_at' => now(),
            'validator_version' => ValidateSubscriptionPlanVersion::VERSION,
            'lock_version' => $version->lock_version + 1,
        ])->save();
        $events->handle($plan, $version, $request->user(), 'subscription_plan_version.validated', 'draft', 'draft', ['validation_results'], outcome: collect($results)->contains('severity', 'error') ? 'blocked' : 'success');

        return back()->with('success', collect($results)->contains('severity', 'error') ? 'Validation found blocking issues.' : 'Validation completed.');
    }

    public function publish(Request $request, SubscriptionPlan $plan, SubscriptionPlanVersion $version, PublishSubscriptionPlanVersion $publisher): RedirectResponse
    {
        $this->authorizeVersion($plan, $version);
        $validated = $request->validate(['reason' => ['required', 'string', 'min:10', 'max:1000'], 'lock_version' => ['required', 'integer']]);
        $user = $request->user();
        abort_unless($user instanceof User, 403);
        $publisher->handle($version, $user, $validated['reason'], (int) $validated['lock_version']);

        return back()->with('success', 'Plan version published and locked.');
    }

    public function cloneVersion(Request $request, SubscriptionPlan $plan, SubscriptionPlanVersion $version, RecordSubscriptionPlanEvent $events): RedirectResponse
    {
        $this->authorizeVersion($plan, $version);
        abort_unless($version->status->isImmutable(), 403);
        $validated = $request->validate([
            'version_number' => ['required', 'integer', 'min:1', 'unique:subscription_plan_versions,version_number,NULL,id,subscription_plan_id,'.$plan->id],
            'change_summary' => ['required', 'string', 'min:10', 'max:1000'],
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
        ]);
        $clone = DB::transaction(function () use ($request, $plan, $version, $validated, $events): SubscriptionPlanVersion {
            $clone = $version->replicate(['status', 'published_at', 'published_by', 'retired_at', 'snapshot_checksum', 'validation_results', 'validated_at', 'validator_version']);
            $clone->forceFill([
                'version_number' => $validated['version_number'],
                'status' => SubscriptionPlanVersionStatus::Draft,
                'change_summary' => $validated['change_summary'],
                'created_by' => $request->user()->id,
                'lock_version' => 1,
            ]);
            $plan->versions()->save($clone);
            $events->handle($plan, $clone, $request->user(), 'subscription_plan_version.cloned', $version->status->value, 'draft', ['version_number', 'change_summary'], $validated['reason']);

            return $clone;
        });

        return to_route('super-admin.subscription-plan-versions.edit', [$plan, $clone])->with('success', 'New draft version created.');
    }

    public function retire(Request $request, SubscriptionPlan $plan, SubscriptionPlanVersion $version, RecordSubscriptionPlanEvent $events): RedirectResponse
    {
        $this->authorizeVersion($plan, $version);
        abort_unless($version->status === SubscriptionPlanVersionStatus::Published, 403);
        $validated = $request->validate(['reason' => ['required', 'string', 'min:10', 'max:1000']]);
        $version->forceFill(['status' => SubscriptionPlanVersionStatus::Retired, 'retired_at' => now()])->save();
        $events->handle($plan, $version, $request->user(), 'subscription_plan_version.retired', 'published', 'retired', ['status', 'retired_at'], $validated['reason']);

        return back()->with('success', 'Plan version retired. Existing subscriptions remain attached.');
    }

    private function authorizeVersion(SubscriptionPlan $plan, SubscriptionPlanVersion $version): void
    {
        Gate::authorize('viewAny', OrganizationSubscription::class);
        abort_unless($version->subscription_plan_id === $plan->id, 404);
    }

    /** @return array<string, mixed> */
    private function detail(SubscriptionPlanVersion $version): array
    {
        return [
            ...$version->only([
                'id', 'version_number', 'currency', 'implementation_amount', 'recurring_amount', 'renewal_amount',
                'billing_cycle', 'vat_rate', 'vat_inclusive', 'grace_period_days', 'commercial_notes',
                'entitlements', 'limits', 'support_configuration', 'change_summary', 'lock_version',
            ]),
            'status' => $version->status->value,
            'effective_from' => $version->effective_from?->toDateString(),
            'effective_until' => $version->effective_until?->toDateString(),
            'price_valid_until' => $version->price_valid_until?->toDateString(),
            'published_at' => $version->published_at?->toIso8601String(),
            'validated_at' => $version->validated_at?->toIso8601String(),
            'validation_results' => $version->validation_results,
            'subscriptions_count' => $version->subscriptions_count ?? 0,
            'snapshot_checksum' => $version->snapshot_checksum,
        ];
    }
}
