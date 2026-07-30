<?php

namespace App\Actions\SuperAdmin\Organizations;

use App\Models\Organization;
use App\Models\OrganizationEvent;
use App\Models\User;
use Illuminate\Support\Str;

class RecordOrganizationEvent
{
    /**
     * @param  array<string, mixed>|null  $before
     * @param  array<string, mixed>|null  $after
     */
    public function handle(Organization $organization, ?User $actor, string $action, ?array $before = null, ?array $after = null, ?string $reason = null): OrganizationEvent
    {
        $event = new OrganizationEvent(['actor_user_id' => $actor?->id, 'action' => $action, 'before_state' => $before, 'after_state' => $after, 'reason' => $reason, 'reference' => (string) Str::uuid()]);
        $organization->events()->save($event);

        return $event;
    }
}
