<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $subscription_plan_version_id
 * @property string $action
 * @property string $outcome
 * @property string|null $previous_status
 * @property string|null $new_status
 * @property string|null $reason
 * @property string $reference
 * @property \Illuminate\Support\Carbon|null $created_at
 */

class SubscriptionPlanEvent extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'actor_user_id',
        'action',
        'outcome',
        'previous_status',
        'new_status',
        'changed_fields',
        'reason',
        'reference',
    ];

    protected function casts(): array
    {
        return ['changed_fields' => 'array'];
    }

    /** @return BelongsTo<SubscriptionPlanVersion, $this> */
    public function version(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlanVersion::class, 'subscription_plan_version_id');
    }

}
