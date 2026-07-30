<?php

namespace Database\Factories;

use App\Models\SubscriptionPlanVersion;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SubscriptionPlanVersion>
 */
class SubscriptionPlanVersionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'subscription_plan_id' => SubscriptionPlan::factory(),
            'version_number' => 1,
            'status' => 'draft',
            'currency' => 'PHP',
            'implementation_amount' => '112000.00',
            'recurring_amount' => '336000.00',
            'billing_cycle' => 'annual',
            'vat_inclusive' => true,
            'entitlements' => [
                'pap_repository' => ['state' => 'included', 'limit' => null],
            ],
            'limits' => [
                'named_users' => ['state' => 'limited', 'value' => 15, 'unit' => 'count', 'period' => 'term'],
                'storage_bytes' => ['state' => 'limited', 'value' => 21474836480, 'unit' => 'bytes', 'period' => 'term'],
            ],
            'support_configuration' => [
                'tier' => 'standard',
                'training_sessions' => 1,
                'administrator_orientation' => false,
                'system_health_review' => false,
                'hosting_included' => true,
                'backups_included' => true,
                'maintenance_included' => true,
                'product_updates' => true,
                'email_support' => true,
                'priority_support' => false,
            ],
            'renewal_amount' => '336000.00',
            'vat_rate' => '12.00',
            'grace_period_days' => 0,
            'change_summary' => 'Initial draft version.',
            'lock_version' => 1,
            'effective_from' => now()->toDateString(),
            'created_by' => User::factory()->superAdmin()->withTwoFactor(),
        ];
    }

    public function published(): static
    {
        return $this->state(fn (): array => [
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    public function retired(): static
    {
        return $this->state(fn (): array => [
            'status' => 'retired',
            'published_at' => now()->subMonth(),
            'retired_at' => now(),
        ]);
    }
}
