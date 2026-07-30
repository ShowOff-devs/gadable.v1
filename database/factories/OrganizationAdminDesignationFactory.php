<?php

namespace Database\Factories;

use App\Models\OrganizationMembership;
use App\Models\OrganizationAdminDesignation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrganizationAdminDesignation>
 */
class OrganizationAdminDesignationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organization_membership_id' => OrganizationMembership::factory(),
            'status' => 'active',
            'effective_at' => now()->subDay(),
            'expires_at' => now()->addYear(),
            'authority_documented_at' => now()->subDay(),
            'revoked_at' => null,
        ];
    }
}
