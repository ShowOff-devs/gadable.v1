<?php

namespace Database\Factories;

use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SubscriptionPlan>
 */
class SubscriptionPlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'family' => fake()->randomElement(['Agency and Institution', 'Deployment Scale']),
            'name' => fake()->unique()->words(2, true),
            'code' => strtoupper(fake()->unique()->bothify('PLAN-####')),
            'description' => fake()->sentence(),
            'is_active' => true,
            'created_by' => User::factory()->superAdmin()->withTwoFactor(),
        ];
    }
}
