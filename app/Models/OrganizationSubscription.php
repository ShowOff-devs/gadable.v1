<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use App\Enums\SubscriptionPlanVersionStatus;
use Database\Factories\OrganizationSubscriptionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $reference
 * @property SubscriptionStatus $status
 * @property \Illuminate\Support\Carbon|null $starts_on
 * @property \Illuminate\Support\Carbon|null $ends_on
 * @property \Illuminate\Support\Carbon|null $renewal_on
 * @property \Illuminate\Support\Carbon|null $grace_ends_on
 * @property string $currency
 * @property string|null $agreed_implementation_amount
 * @property string|null $agreed_recurring_amount
 * @property bool|null $vat_inclusive
 * @property array<string, mixed>|null $entitlement_overrides
 * @property string|null $contract_status
 * @property string|null $contract_reference
 * @property string|null $purchase_order_reference
 * @property string|null $invoice_reference
 * @property string|null $payment_confirmation_reference
 * @property int $lock_version
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read Organization $organization
 * @property-read SubscriptionPlanVersion $planVersion
 */
#[Fillable(['organization_id', 'subscription_plan_version_id', 'reference', 'status', 'starts_on', 'ends_on', 'renewal_on', 'grace_ends_on', 'currency', 'agreed_implementation_amount', 'agreed_recurring_amount', 'vat_inclusive', 'entitlement_overrides', 'contract_status', 'contract_reference', 'purchase_order_reference', 'invoice_reference', 'payment_confirmation_reference', 'lock_version', 'created_by', 'updated_by'])]
class OrganizationSubscription extends Model
{
    /** @use HasFactory<OrganizationSubscriptionFactory> */
    use HasFactory;

    protected $attributes = [
        'status' => 'draft',
        'currency' => 'PHP',
        'lock_version' => 1,
    ];

    protected function casts(): array
    {
        return [
            'status' => SubscriptionStatus::class,
            'starts_on' => 'date',
            'ends_on' => 'date',
            'renewal_on' => 'date',
            'grace_ends_on' => 'date',
            'agreed_implementation_amount' => 'decimal:2',
            'agreed_recurring_amount' => 'decimal:2',
            'vat_inclusive' => 'boolean',
            'entitlement_overrides' => 'array',
        ];
    }

    /** @return BelongsTo<Organization, $this> */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /** @return BelongsTo<SubscriptionPlanVersion, $this> */
    public function planVersion(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlanVersion::class, 'subscription_plan_version_id');
    }

    protected static function booted(): void
    {
        static::creating(function (self $subscription): void {
            $isPublished = SubscriptionPlanVersion::query()
                ->whereKey($subscription->subscription_plan_version_id)
                ->where('status', SubscriptionPlanVersionStatus::Published)
                ->exists();

            if (! $isPublished) {
                throw new \LogicException('Only a published plan version may be assigned to an organization.');
            }
        });

        static::updating(function (self $subscription): void {
            if (! $subscription->isDirty('subscription_plan_version_id')) {
                return;
            }

            $isPublished = SubscriptionPlanVersion::query()
                ->whereKey($subscription->subscription_plan_version_id)
                ->where('status', SubscriptionPlanVersionStatus::Published)
                ->exists();

            if (! $isPublished) {
                throw new \LogicException('Only a published plan version may be assigned to an organization.');
            }
        });
    }
}
