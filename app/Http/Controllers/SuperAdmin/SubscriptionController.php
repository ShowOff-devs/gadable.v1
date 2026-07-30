<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Contracts\LabelledEnum;
use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Models\OrganizationSubscription;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', OrganizationSubscription::class);
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::enum(SubscriptionStatus::class)],
            'plan' => ['nullable', 'integer', 'exists:subscription_plans,id'],
            'contract_status' => ['nullable', 'string', 'max:50'],
        ]);

        $subscriptions = OrganizationSubscription::query()
            ->select(['id', 'organization_id', 'subscription_plan_version_id', 'reference', 'status', 'starts_on', 'ends_on', 'renewal_on', 'currency', 'agreed_recurring_amount', 'vat_inclusive', 'contract_status', 'updated_at'])
            ->with([
                'organization:id,official_name,code,organization_type',
                'planVersion:id,subscription_plan_id,version_number,billing_cycle',
                'planVersion.plan:id,family,name',
            ])
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($nested) => $nested
                ->where('reference', 'like', "%{$search}%")
                ->orWhereHas('organization', fn ($organization) => $organization
                    ->where('official_name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%"))))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['plan'] ?? null, fn ($query, $plan) => $query->whereHas(
                'planVersion',
                fn ($version) => $version->where('subscription_plan_id', $plan),
            ))
            ->when($filters['contract_status'] ?? null, fn ($query, $status) => $query->where('contract_status', $status))
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (OrganizationSubscription $subscription): array => $this->summary($subscription));

        return Inertia::render('super-admin/subscriptions/index', [
            'subscriptions' => $subscriptions,
            'filters' => $filters,
            'filterOptions' => [
                'statuses' => $this->enumOptions(SubscriptionStatus::cases()),
                'plans' => SubscriptionPlan::query()->orderBy('name')->get(['id', 'name', 'family']),
                'contractStatuses' => OrganizationSubscription::query()
                    ->whereNotNull('contract_status')
                    ->distinct()
                    ->orderBy('contract_status')
                    ->pluck('contract_status'),
            ],
            'counts' => [
                'active' => OrganizationSubscription::where('status', SubscriptionStatus::Active)->count(),
                'trial' => OrganizationSubscription::where('status', SubscriptionStatus::Trial)->count(),
                'expiring' => OrganizationSubscription::whereIn('status', [SubscriptionStatus::Active, SubscriptionStatus::Trial])
                    ->whereBetween('ends_on', [today(), today()->addDays(30)])
                    ->count(),
                'grace' => OrganizationSubscription::where('status', SubscriptionStatus::Grace)->count(),
                'readOnly' => OrganizationSubscription::where('status', SubscriptionStatus::ReadOnly)->count(),
                'suspended' => OrganizationSubscription::where('status', SubscriptionStatus::Suspended)->count(),
                'recurringAnnualValue' => null,
                'recurringAnnualValueAvailable' => false,
            ],
            'timezone' => config('app.timezone'),
        ]);
    }

    public function plans(): Response
    {
        Gate::authorize('viewAny', OrganizationSubscription::class);

        return Inertia::render('super-admin/subscriptions/plans', [
            'plans' => SubscriptionPlan::query()
                ->with(['versions' => fn ($query) => $query
                    ->withCount('subscriptions')
                    ->orderByDesc('version_number')])
                ->orderBy('family')
                ->orderBy('name')
                ->get()
                ->map(fn (SubscriptionPlan $plan): array => [
                    'id' => $plan->id,
                    'family' => $plan->family,
                    'name' => $plan->name,
                    'code' => $plan->code,
                    'active' => $plan->is_active,
                    'versions' => $plan->versions
                        ->map(fn (SubscriptionPlanVersion $version): array => [
                            'id' => $version->id,
                            'number' => $version->version_number,
                            'status' => $version->status->value,
                            'currency' => $version->currency,
                            'implementationAmount' => $version->implementation_amount,
                            'recurringAmount' => $version->recurring_amount,
                            'billingCycle' => $version->billing_cycle,
                            'vatInclusive' => $version->vat_inclusive,
                            'subscriptionsCount' => $version->subscriptions_count,
                            'immutable' => $version->status->isImmutable(),
                        ])
                        ->values()
                        ->all(),
                ])
                ->values()
                ->all(),
        ]);
    }

    public function show(OrganizationSubscription $subscription): Response
    {
        Gate::authorize('view', $subscription);
        $subscription->load([
            'organization:id,official_name,code,organization_type,account_status',
            'planVersion.plan:id,family,name,code',
        ]);

        return Inertia::render('super-admin/subscriptions/show', [
            'subscription' => [
                ...$this->summary($subscription),
                'organizationStatus' => $subscription->organization->account_status->value,
                'planVersionStatus' => $subscription->planVersion->status->value,
                'standardImplementationAmount' => $subscription->planVersion->implementation_amount,
                'standardRecurringAmount' => $subscription->planVersion->recurring_amount,
                'agreedImplementationAmount' => $subscription->agreed_implementation_amount,
                'entitlements' => $subscription->planVersion->entitlements,
                'entitlementOverrides' => $subscription->entitlement_overrides,
                'contractReference' => $subscription->contract_reference,
                'purchaseOrderReference' => $subscription->purchase_order_reference,
                'invoiceReference' => $subscription->invoice_reference,
                'paymentConfirmationReference' => $subscription->payment_confirmation_reference,
                'graceEndsOn' => $subscription->grace_ends_on?->toDateString(),
                'lockVersion' => $subscription->lock_version,
            ],
            'timezone' => config('app.timezone'),
        ]);
    }

    /** @return array<string, mixed> */
    private function summary(OrganizationSubscription $subscription): array
    {
        return [
            'id' => $subscription->id,
            'reference' => $subscription->reference,
            'status' => $subscription->status->value,
            'organization' => [
                'id' => $subscription->organization->id,
                'name' => $subscription->organization->official_name,
                'code' => $subscription->organization->code,
                'type' => $subscription->organization->organization_type,
            ],
            'plan' => [
                'id' => $subscription->planVersion->plan->id,
                'family' => $subscription->planVersion->plan->family,
                'name' => $subscription->planVersion->plan->name,
                'version' => $subscription->planVersion->version_number,
                'billingCycle' => $subscription->planVersion->billing_cycle,
            ],
            'startsOn' => $subscription->starts_on?->toDateString(),
            'endsOn' => $subscription->ends_on?->toDateString(),
            'renewalOn' => $subscription->renewal_on?->toDateString(),
            'currency' => $subscription->currency,
            'agreedRecurringAmount' => $subscription->agreed_recurring_amount,
            'vatInclusive' => $subscription->vat_inclusive,
            'contractStatus' => $subscription->contract_status,
            'updatedAt' => $subscription->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @param  array<int, LabelledEnum&\BackedEnum>  $cases
     * @return array<int, array{value:string, label:string}>
     */
    private function enumOptions(array $cases): array
    {
        return array_map(
            fn ($case): array => ['value' => (string) $case->value, 'label' => $case->label()],
            $cases,
        );
    }
}
