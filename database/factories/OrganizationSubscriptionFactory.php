<?php

namespace Database\Factories;

use App\Models\OrganizationSubscription;
use App\Models\Organization;
use App\Models\SubscriptionPlanVersion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<OrganizationSubscription>
 */
class OrganizationSubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'subscription_plan_version_id' => SubscriptionPlanVersion::factory()->published(),
            'reference' => 'SUB-'.strtoupper(Str::random(10)),
            'status' => 'active',
            'starts_on' => now()->startOfYear()->toDateString(),
            'ends_on' => now()->endOfYear()->toDateString(),
            'renewal_on' => now()->endOfYear()->subMonth()->toDateString(),
            'currency' => 'PHP',
            'agreed_implementation_amount' => '112000.00',
            'agreed_recurring_amount' => '336000.00',
            'vat_inclusive' => true,
            'contract_status' => 'confirmed',
            'contract_reference' => 'CONTRACT-'.strtoupper(Str::random(8)),
            'lock_version' => 1,
            'created_by' => User::factory()->superAdmin()->withTwoFactor(),
        ];
    }
}
