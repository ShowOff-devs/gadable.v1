<?php

namespace App\Models;

use App\Enums\SubscriptionPlanVersionStatus;
use Database\Factories\SubscriptionPlanVersionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $subscription_plan_id
 * @property int $version_number
 * @property SubscriptionPlanVersionStatus $status
 * @property string $currency
 * @property string|null $implementation_amount
 * @property string|null $recurring_amount
 * @property string|null $renewal_amount
 * @property string|null $billing_cycle
 * @property string|null $vat_rate
 * @property bool|null $vat_inclusive
 * @property int $grace_period_days
 * @property array<string, mixed> $entitlements
 * @property array<string, mixed>|null $limits
 * @property array<string, mixed>|null $support_configuration
 * @property string|null $change_summary
 * @property array<int, array<string, mixed>>|null $validation_results
 * @property \Illuminate\Support\Carbon|null $effective_from
 * @property \Illuminate\Support\Carbon|null $effective_until
 * @property \Illuminate\Support\Carbon|null $price_valid_until
 * @property \Illuminate\Support\Carbon|null $validated_at
 * @property \Illuminate\Support\Carbon|null $published_at
 * @property string|null $snapshot_checksum
 * @property int $lock_version
 * @property int $subscriptions_count
 * @property-read SubscriptionPlan $plan
 * @property-read \Illuminate\Database\Eloquent\Collection<int, OrganizationSubscription> $subscriptions
 * @property-read \Illuminate\Database\Eloquent\Collection<int, SubscriptionPlanEvent> $events
 */
#[Fillable(['subscription_plan_id', 'version_number', 'status', 'currency', 'implementation_amount', 'recurring_amount', 'renewal_amount', 'billing_cycle', 'vat_rate', 'vat_inclusive', 'grace_period_days', 'price_valid_until', 'effective_from', 'effective_until', 'commercial_notes', 'entitlements', 'limits', 'support_configuration', 'change_summary', 'validation_results', 'validated_at', 'validator_version', 'snapshot_checksum', 'lock_version', 'published_at', 'retired_at', 'created_by', 'published_by'])]
class SubscriptionPlanVersion extends Model
{
    /** @use HasFactory<SubscriptionPlanVersionFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => SubscriptionPlanVersionStatus::class,
            'implementation_amount' => 'decimal:2',
            'recurring_amount' => 'decimal:2',
            'renewal_amount' => 'decimal:2',
            'vat_rate' => 'decimal:2',
            'vat_inclusive' => 'boolean',
            'entitlements' => 'array',
            'limits' => 'array',
            'support_configuration' => 'array',
            'validation_results' => 'array',
            'effective_from' => 'date',
            'effective_until' => 'date',
            'price_valid_until' => 'date',
            'validated_at' => 'datetime',
            'published_at' => 'datetime',
            'retired_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<SubscriptionPlan, $this> */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    /** @return HasMany<OrganizationSubscription, $this> */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(OrganizationSubscription::class);
    }

    /** @return HasMany<SubscriptionPlanEvent, $this> */
    public function events(): HasMany
    {
        return $this->hasMany(SubscriptionPlanEvent::class);
    }

    protected static function booted(): void
    {
        static::updating(function (self $version): void {
            if ($version->getRawOriginal('status') !== SubscriptionPlanVersionStatus::Draft->value) {
                $isRetirementOnly = $version->getRawOriginal('status') === SubscriptionPlanVersionStatus::Published->value
                    && $version->status === SubscriptionPlanVersionStatus::Retired
                    && array_diff(array_keys($version->getDirty()), ['status', 'retired_at', 'updated_at']) === [];

                if ($isRetirementOnly) {
                    return;
                }

                throw new \LogicException('Published, retired, and archived plan versions are immutable.');
            }
        });
    }
}
