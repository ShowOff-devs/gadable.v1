<?php

namespace App\Actions\SuperAdmin\Organizations;

use App\Enums\OrganizationStatus;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransitionOrganizationStatus
{
    public function __construct(private RecordOrganizationEvent $events) {}

    public function handle(Organization $organization, User $actor, OrganizationStatus $target, string $reason, int $version): Organization
    {
        return DB::transaction(function () use ($organization, $actor, $target, $reason, $version): Organization {
            $locked = Organization::query()->lockForUpdate()->findOrFail($organization->id);
            if ($locked->lock_version !== $version) {
                throw ValidationException::withMessages(['lock_version' => 'This record changed. Refresh and try again.']);
            }
            $allowed = [
                'pending_activation' => ['active', 'archived', 'terminated'],
                'active' => ['restricted', 'suspended', 'archived', 'terminated'],
                'restricted' => ['active', 'suspended', 'archived', 'terminated'],
                'suspended' => ['active', 'restricted', 'archived', 'terminated'],
                'archived' => ['pending_activation', 'terminated'],
            ];
            $current = $locked->account_status->value;
            if (! in_array($target->value, $allowed[$current] ?? [], true)) {
                throw ValidationException::withMessages(['target' => "The transition from {$current} to {$target->value} is not allowed."]);
            }
            if ($target === OrganizationStatus::Active && ! $locked->isActivationReady()) {
                throw ValidationException::withMessages([
                    'target' => 'Activation is blocked: '.implode('; ', $locked->activationBlockers()).'.',
                ]);
            }
            $before = ['account_status' => $current, 'lock_version' => $locked->lock_version];
            $timestamps = match ($target) {
                OrganizationStatus::Active => ['activated_at' => now()],
                OrganizationStatus::Suspended => ['suspended_at' => now()],
                OrganizationStatus::Archived => ['archived_at' => now()],
                OrganizationStatus::Terminated => ['terminated_at' => now()],
                default => [],
            };
            $locked->forceFill([...$timestamps, 'account_status' => $target, 'updated_by' => $actor->id, 'lock_version' => $locked->lock_version + 1])->save();
            $this->events->handle($locked, $actor, 'organization.status_transitioned', $before, ['account_status' => $target->value, 'lock_version' => $locked->lock_version], $reason);
            return $locked;
        });
    }
}
