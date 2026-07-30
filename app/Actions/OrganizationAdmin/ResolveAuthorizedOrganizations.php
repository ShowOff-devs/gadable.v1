<?php

namespace App\Actions\OrganizationAdmin;

use App\Enums\OrganizationStatus;
use App\Actions\Subscriptions\ResolveOrganizationSubscriptionAccess;
use App\Models\Organization;
use App\Models\OrganizationAdminDesignation;
use App\Models\OrganizationMembership;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ResolveAuthorizedOrganizations
{
    public function __construct(
        private ResolveOrganizationSubscriptionAccess $resolveSubscriptionAccess,
    ) {}

    /** @return Collection<int, Organization> */
    public function handle(User $user): Collection
    {
        return Organization::query()
            ->where('account_status', OrganizationStatus::Active)
            ->whereHas('memberships', function ($membershipQuery) use ($user): void {
                $membershipQuery
                    ->where('user_id', $user->getKey())
                    ->where('status', OrganizationMembership::STATUS_ACTIVE)
                    ->where(fn ($query) => $query->whereNull('started_at')->orWhere('started_at', '<=', now()))
                    ->where(fn ($query) => $query->whereNull('ended_at')->orWhere('ended_at', '>', now()))
                    ->whereHas('adminDesignations', function ($designationQuery): void {
                        $designationQuery
                            ->where('status', OrganizationAdminDesignation::STATUS_ACTIVE)
                            ->whereNotNull('authority_documented_at')
                            ->whereNull('revoked_at')
                            ->where('effective_at', '<=', now())
                            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()));
                    });
            })
            ->orderBy('official_name')
            ->get()
            ->filter(fn (Organization $organization): bool => $this->resolveSubscriptionAccess
                ->handle($organization)
                ->canAccess)
            ->values();
    }
}
