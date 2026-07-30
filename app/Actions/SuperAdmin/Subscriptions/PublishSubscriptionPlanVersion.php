<?php

namespace App\Actions\SuperAdmin\Subscriptions;

use App\Enums\SubscriptionPlanVersionStatus;
use App\Models\SubscriptionPlanVersion;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PublishSubscriptionPlanVersion
{
    public function __construct(
        private RecordSubscriptionPlanEvent $events,
    ) {}

    public function handle(SubscriptionPlanVersion $version, User $actor, string $reason, int $lockVersion): SubscriptionPlanVersion
    {
        return DB::transaction(function () use ($version, $actor, $reason, $lockVersion): SubscriptionPlanVersion {
            $locked = SubscriptionPlanVersion::query()->lockForUpdate()->findOrFail($version->id);

            if ($locked->status !== SubscriptionPlanVersionStatus::Draft || $locked->lock_version !== $lockVersion) {
                throw ValidationException::withMessages(['lock_version' => 'This draft changed or is no longer publishable. Refresh and try again.']);
            }
            if ($locked->validated_at === null || collect($locked->validation_results)->contains('severity', 'error')) {
                throw ValidationException::withMessages(['publication' => 'Successful validation is required before publication.']);
            }

            $locked->forceFill([
                'status' => SubscriptionPlanVersionStatus::Published,
                'published_at' => now(),
                'published_by' => $actor->id,
                'snapshot_checksum' => hash('sha256', json_encode($locked->only([
                    'subscription_plan_id', 'version_number', 'currency', 'implementation_amount',
                    'recurring_amount', 'renewal_amount', 'billing_cycle', 'vat_rate', 'vat_inclusive',
                    'grace_period_days', 'effective_from', 'effective_until', 'limits',
                    'entitlements', 'support_configuration',
                ]), JSON_THROW_ON_ERROR)),
                'lock_version' => $locked->lock_version + 1,
            ])->save();

            $this->events->handle($locked->plan, $locked, $actor, 'subscription_plan_version.published', 'draft', 'published', ['status', 'published_at', 'snapshot_checksum'], $reason);

            return $locked;
        });
    }
}
