<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\User;
use App\Models\OrganizationMembership;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrganizationMembership>
 */
class OrganizationMembershipFactory extends Factory
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
            'user_id' => User::factory()->organizationAdmin()->withTwoFactor(),
            'status' => 'active',
            'started_at' => now(),
            'ended_at' => null,
        ];
    }
}
