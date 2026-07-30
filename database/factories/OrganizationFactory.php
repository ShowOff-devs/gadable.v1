<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Organization>
 */
class OrganizationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'official_name' => fake()->unique()->company(),
            'code' => strtoupper(fake()->unique()->bothify('ORG-####')),
            'email' => fake()->companyEmail(),
            'data_classification' => 'standard',
            'onboarding_status' => 'draft',
            'account_status' => 'pending_activation',
            'lock_version' => 1,
            'identity_verified' => false,
            'authority_verified' => false,
            'primary_admin_ready' => false,
            'subscription_ready' => false,
            'security_ready' => false,
            'has_critical_issue' => false,
            'created_by' => User::factory()->superAdmin()->withTwoFactor(),
        ];
    }
}
