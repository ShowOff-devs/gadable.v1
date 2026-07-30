<?php

namespace App\Actions\SuperAdmin\Organizations;

use App\Enums\OrganizationOnboardingStatus;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransitionOrganizationOnboarding
{
    public function __construct(private RecordOrganizationEvent $events) {}

    public function handle(Organization $organization, User $actor, OrganizationOnboardingStatus $target, string $reason, int $version): Organization
    {
        return DB::transaction(function () use ($organization, $actor, $target, $reason, $version): Organization {
            $locked = Organization::query()->lockForUpdate()->findOrFail($organization->id);
            if ($locked->lock_version !== $version) {
                throw ValidationException::withMessages(['lock_version' => 'This record changed. Refresh and try again.']);
            }
            $allowed = [
                'draft' => ['submitted', 'cancelled'],
                'submitted' => ['under_review', 'for_clarification', 'cancelled'],
                'under_review' => ['for_clarification', 'verified', 'rejected'],
                'for_clarification' => ['submitted', 'cancelled'],
                'verified' => ['approved', 'for_clarification', 'rejected'],
                'rejected' => ['draft'],
            ];
            $current = $locked->onboarding_status->value;
            if (! in_array($target->value, $allowed[$current] ?? [], true)) {
                throw ValidationException::withMessages(['target' => "The transition from {$current} to {$target->value} is not allowed."]);
            }
            $before = ['onboarding_status' => $current, 'lock_version' => $locked->lock_version];
            $locked->forceFill(['onboarding_status' => $target, 'updated_by' => $actor->id, 'lock_version' => $locked->lock_version + 1])->save();
            $this->events->handle($locked, $actor, 'organization.onboarding_transitioned', $before, ['onboarding_status' => $target->value, 'lock_version' => $locked->lock_version], $reason);
            return $locked;
        });
    }
}
