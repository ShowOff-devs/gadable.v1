<?php

namespace App\Data;

use App\Enums\SubscriptionStatus;

final readonly class OrganizationSubscriptionAccess
{
    public function __construct(
        public int $organizationId,
        public ?int $subscriptionId,
        public ?int $planId,
        public ?int $planVersionId,
        public ?SubscriptionStatus $lifecycleStatus,
        public string $accessLevel,
        public bool $canAccess,
        public bool $canWrite,
        public string $reasonCode,
        public string $reasonMessage,
        public ?string $effectiveAt,
        public ?string $expiresAt,
        public ?string $graceEndsAt,
        public ?string $readOnlyAt,
        public ?string $suspendedAt,
        public ?int $lockVersion,
    ) {}

    /** @return array<string, bool|int|string|null> */
    public function toArray(): array
    {
        return [
            'organization_id' => $this->organizationId,
            'subscription_id' => $this->subscriptionId,
            'plan_id' => $this->planId,
            'plan_version_id' => $this->planVersionId,
            'lifecycle_status' => $this->lifecycleStatus?->value,
            'access_level' => $this->accessLevel,
            'can_access' => $this->canAccess,
            'can_write' => $this->canWrite,
            'reason_code' => $this->reasonCode,
            'reason_message' => $this->reasonMessage,
            'effective_at' => $this->effectiveAt,
            'expires_at' => $this->expiresAt,
            'grace_ends_at' => $this->graceEndsAt,
            'read_only_at' => $this->readOnlyAt,
            'suspended_at' => $this->suspendedAt,
            'lock_version' => $this->lockVersion,
        ];
    }
}
