<?php

namespace App\Actions\Subscriptions;

use App\Data\OrganizationSubscriptionAccess;
use App\Enums\SubscriptionStatus;
use App\Models\Organization;
use App\Models\OrganizationSubscription;

class ResolveOrganizationSubscriptionAccess
{
    /** @var array<string, OrganizationSubscriptionAccess> */
    private array $resolved = [];

    public function handle(Organization|int $organization): OrganizationSubscriptionAccess
    {
        $organizationId = $organization instanceof Organization ? $organization->getKey() : $organization;
        $cacheKey = "organization:{$organizationId}";

        return $this->resolved[$cacheKey] ??= $this->resolve($organizationId);
    }

    public function forget(Organization|int $organization): void
    {
        $organizationId = $organization instanceof Organization ? $organization->getKey() : $organization;
        unset($this->resolved["organization:{$organizationId}"]);
    }

    private function resolve(int $organizationId): OrganizationSubscriptionAccess
    {
        $subscription = OrganizationSubscription::query()
            ->with('planVersion:id,subscription_plan_id')
            ->where('organization_id', $organizationId)
            ->orderByRaw("case status when 'active' then 1 when 'trial' then 2 when 'grace' then 3 when 'read_only' then 4 when 'scheduled' then 5 when 'suspended' then 6 else 7 end")
            ->latest('starts_on')
            ->first();

        if (! $subscription) {
            return $this->denied($organizationId, 'subscription_missing', 'No current organization subscription is available.');
        }

        $status = $subscription->status;
        $today = today();
        if (in_array($status, [
            SubscriptionStatus::Draft,
            SubscriptionStatus::Expired,
            SubscriptionStatus::Cancelled,
            SubscriptionStatus::Terminated,
        ], true)) {
            return $this->result(
                $subscription,
                false,
                false,
                'denied',
                "subscription_{$status->value}",
                "The organization subscription is {$status->label()}.",
            );
        }
        if ($subscription->starts_on?->isAfter($today)) {
            return $this->result($subscription, false, false, 'denied', 'subscription_not_started', 'The subscription is not effective yet.');
        }

        if ($status === SubscriptionStatus::Scheduled) {
            return $this->result($subscription, false, false, 'denied', 'subscription_scheduled', 'The subscription is scheduled and not yet active.');
        }

        if ($status === SubscriptionStatus::Suspended) {
            return $this->result($subscription, false, false, 'denied', 'subscription_suspended', 'The organization subscription is suspended.');
        }

        if ($status === SubscriptionStatus::Grace && $subscription->grace_ends_on?->isBefore($today)) {
            return $this->result($subscription, false, false, 'denied', 'subscription_grace_ended', 'The subscription grace period has ended.');
        }

        if ($subscription->ends_on?->isBefore($today) && $status !== SubscriptionStatus::Grace) {
            return $this->result($subscription, false, false, 'denied', 'subscription_expired', 'The organization subscription has expired.');
        }

        if ($status === SubscriptionStatus::ReadOnly) {
            return $this->result($subscription, true, false, 'read_only', 'subscription_read_only', 'The subscription permits viewing existing records only.');
        }

        return $this->result($subscription, true, true, 'full', 'subscription_access_granted', 'Subscription access is active.');
    }

    private function denied(int $organizationId, string $code, string $message): OrganizationSubscriptionAccess
    {
        return new OrganizationSubscriptionAccess(
            $organizationId, null, null, null, null, 'denied', false, false,
            $code, $message, null, null, null, null, null, null,
        );
    }

    private function result(
        OrganizationSubscription $subscription,
        bool $canAccess,
        bool $canWrite,
        string $level,
        string $code,
        string $message,
    ): OrganizationSubscriptionAccess {
        return new OrganizationSubscriptionAccess(
            organizationId: $subscription->organization_id,
            subscriptionId: $subscription->getKey(),
            planId: $subscription->planVersion->subscription_plan_id,
            planVersionId: $subscription->subscription_plan_version_id,
            lifecycleStatus: $subscription->status,
            accessLevel: $level,
            canAccess: $canAccess,
            canWrite: $canWrite,
            reasonCode: $code,
            reasonMessage: $message,
            effectiveAt: $subscription->starts_on?->toDateString(),
            expiresAt: $subscription->ends_on?->toDateString(),
            graceEndsAt: $subscription->grace_ends_on?->toDateString(),
            readOnlyAt: null,
            suspendedAt: null,
            lockVersion: $subscription->lock_version,
        );
    }
}
