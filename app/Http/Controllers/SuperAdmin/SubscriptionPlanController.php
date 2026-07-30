<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Actions\SuperAdmin\Subscriptions\RecordSubscriptionPlanEvent;
use App\Enums\SubscriptionPlanVersionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\StoreSubscriptionPlanRequest;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanVersion;
use App\Models\OrganizationSubscription;
use App\Support\SubscriptionPlanCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionPlanController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', OrganizationSubscription::class);
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::enum(SubscriptionPlanVersionStatus::class)],
            'family' => ['nullable', 'string', 'max:100'],
            'billing_cycle' => ['nullable', Rule::in(['monthly', 'quarterly', 'annual', 'custom'])],
        ]);

        $plans = SubscriptionPlan::query()
            ->with(['versions' => fn ($query) => $query->withCount('subscriptions')->orderByDesc('version_number')])
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($nested) => $nested
                ->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%")))
            ->when($filters['family'] ?? null, fn ($query, $family) => $query->where('family', $family))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->whereHas('versions', fn ($version) => $version->where('status', $status)))
            ->when($filters['billing_cycle'] ?? null, fn ($query, $cycle) => $query->whereHas('versions', fn ($version) => $version->where('billing_cycle', $cycle)))
            ->latest('updated_at')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (SubscriptionPlan $plan): array => $this->summary($plan));

        return Inertia::render('super-admin/subscriptions/plans', [
            'plans' => $plans,
            'filters' => $filters,
            'filterOptions' => [
                'families' => SubscriptionPlan::query()->distinct()->orderBy('family')->pluck('family'),
                'statuses' => array_map(fn ($status) => ['value' => $status->value, 'label' => $status->label()], SubscriptionPlanVersionStatus::cases()),
                'billingCycles' => ['monthly', 'quarterly', 'annual', 'custom'],
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', OrganizationSubscription::class);

        return Inertia::render('super-admin/subscriptions/plan-form', [
            ...$this->formOptions(),
            'plan' => null,
            'version' => null,
        ]);
    }

    public function store(StoreSubscriptionPlanRequest $request, RecordSubscriptionPlanEvent $events): RedirectResponse
    {
        Gate::authorize('create', OrganizationSubscription::class);

        [$plan, $version] = DB::transaction(function () use ($request, $events): array {
            $validated = $request->validated();
            $plan = SubscriptionPlan::create([
                ...Arr::only($validated, ['family', 'name', 'code', 'description', 'intended_customer_type', 'deployment_scope']),
                'created_by' => $request->user()->id,
            ]);
            $version = $plan->versions()->create([
                ...Arr::except($validated, ['family', 'name', 'code', 'description', 'intended_customer_type', 'deployment_scope']),
                'status' => SubscriptionPlanVersionStatus::Draft,
                'created_by' => $request->user()->id,
                'lock_version' => 1,
            ]);
            $events->handle($plan, $version, $request->user(), 'subscription_plan.created', null, 'draft', ['family', 'name', 'code', 'version_number']);

            return [$plan, $version];
        });

        return to_route('super-admin.subscription-plan-versions.show', [$plan, $version])
            ->with('success', 'Plan and initial draft version created.');
    }

    public function show(SubscriptionPlan $plan): Response
    {
        Gate::authorize('viewAny', OrganizationSubscription::class);
        $plan->load([
            'versions' => fn ($query) => $query->withCount('subscriptions')->orderByDesc('version_number'),
            'events' => fn ($query) => $query->latest()->limit(50),
        ]);

        return Inertia::render('super-admin/subscriptions/plan-show', [
            'plan' => $this->summary($plan),
            'events' => $plan->events->map(fn ($event) => [
                'id' => $event->id,
                'action' => $event->action,
                'outcome' => $event->outcome,
                'previousStatus' => $event->previous_status,
                'newStatus' => $event->new_status,
                'reason' => $event->reason,
                'reference' => $event->reference,
                'createdAt' => $event->created_at?->toIso8601String(),
            ]),
        ]);
    }

    /** @return array<string, mixed> */
    private function summary(SubscriptionPlan $plan): array
    {
        return [
            'id' => $plan->id,
            'family' => $plan->family,
            'name' => $plan->name,
            'code' => $plan->code,
            'description' => $plan->description,
            'intendedCustomerType' => $plan->intended_customer_type,
            'deploymentScope' => $plan->deployment_scope,
            'active' => $plan->is_active,
            'updatedAt' => $plan->updated_at->toIso8601String(),
            'versions' => $plan->versions->map(fn (SubscriptionPlanVersion $version) => [
                'id' => $version->id,
                'number' => $version->version_number,
                'status' => $version->status->value,
                'currency' => $version->currency,
                'implementationAmount' => $version->implementation_amount,
                'recurringAmount' => $version->recurring_amount,
                'renewalAmount' => $version->renewal_amount,
                'billingCycle' => $version->billing_cycle,
                'vatInclusive' => $version->vat_inclusive,
                'effectiveFrom' => $version->effective_from?->toDateString(),
                'subscriptionsCount' => $version->subscriptions_count,
                'immutable' => $version->status->isImmutable(),
                'lockVersion' => $version->lock_version,
            ])->values()->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function formOptions(): array
    {
        return [
            'limitDefinitions' => SubscriptionPlanCatalog::LIMITS,
            'entitlementDefinitions' => SubscriptionPlanCatalog::ENTITLEMENTS,
            'billingCycles' => ['monthly', 'quarterly', 'annual', 'custom'],
            'supportTiers' => ['standard', 'priority', 'premium', 'custom'],
        ];
    }
}
