<?php

namespace App\Actions\SuperAdmin\Subscriptions;

use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanEvent;
use App\Models\SubscriptionPlanVersion;
use App\Models\User;
use Illuminate\Support\Str;

class RecordSubscriptionPlanEvent
{
    /** @param array<int, string>|null $changedFields */
    public function handle(
        SubscriptionPlan $plan,
        ?SubscriptionPlanVersion $version,
        ?User $actor,
        string $action,
        ?string $previousStatus = null,
        ?string $newStatus = null,
        ?array $changedFields = null,
        ?string $reason = null,
        string $outcome = 'success',
    ): SubscriptionPlanEvent {
        $event = new SubscriptionPlanEvent([
            'actor_user_id' => $actor?->id,
            'action' => $action,
            'outcome' => $outcome,
            'previous_status' => $previousStatus,
            'new_status' => $newStatus,
            'changed_fields' => $changedFields,
            'reason' => $reason,
            'reference' => (string) Str::uuid(),
        ]);
        $event->version()->associate($version);
        $plan->events()->save($event);

        return $event;
    }
}
