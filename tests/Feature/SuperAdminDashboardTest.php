<?php

use App\Models\SecurityEvent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

function actingAsVerifiedSuperAdmin(User $user): void
{
    test()->actingAs($user)->withSession([
        'super_admin.mfa_verified_at' => now()->timestamp,
    ]);
}

it('redirects guests to the dedicated super admin login', function () {
    $this->get(route('super-admin.dashboard'))
        ->assertRedirect(route('super-admin.login'));
});

it('allows an active MFA-verified super admin to view real dashboard aggregates', function () {
    $superAdmin = User::factory()->superAdmin()->withTwoFactor()->create();
    User::factory()->count(2)->create();

    DB::table('failed_jobs')->insert([
        'uuid' => fake()->uuid(),
        'connection' => 'database',
        'queue' => 'default',
        'payload' => '{}',
        'exception' => 'Safe test exception',
        'failed_at' => now(),
    ]);

    actingAsVerifiedSuperAdmin($superAdmin);

    $this->get(route('super-admin.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/dashboard')
            ->where('dashboard.filters.period', '7d')
            ->where('dashboard.summary.1.value', 3)
            ->where('dashboard.operations.failedJobs', 1)
            ->where('dashboard.attention.0.id', 'failed-jobs')
            ->where('dashboard.health.2.status', 'attention_needed')
            ->where('dashboard.availability.organizations', true)
            ->where('dashboard.availability.financials', false)
        );
});

it('requires a completed portal MFA session', function () {
    $superAdmin = User::factory()->superAdmin()->withTwoFactor()->create();

    $this->actingAs($superAdmin)
        ->get(route('super-admin.dashboard'))
        ->assertRedirect(route('super-admin.login'));

    $this->assertGuest();
});

it('forbids non-super-admin accounts', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['super_admin.mfa_verified_at' => now()->timestamp])
        ->get(route('super-admin.dashboard'))
        ->assertForbidden();
});

it('forbids unavailable super admin accounts', function (string $status) {
    $user = User::factory()
        ->superAdmin()
        ->withTwoFactor()
        ->withAccountStatus($status)
        ->create();

    $this->actingAs($user)
        ->withSession(['super_admin.mfa_verified_at' => now()->timestamp])
        ->get(route('super-admin.dashboard'))
        ->assertForbidden();
})->with(['disabled', 'archived', 'suspended', 'locked']);

it('validates and preserves supported reporting periods', function () {
    $superAdmin = User::factory()->superAdmin()->withTwoFactor()->create();
    actingAsVerifiedSuperAdmin($superAdmin);

    $this->get(route('super-admin.dashboard', ['period' => '30d']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('dashboard.filters.period', '30d')
        );

    $this->get(route('super-admin.dashboard', ['period' => 'all-time']))
        ->assertSessionHasErrors('period');
});

it('does not expose confidential or credential fields in dashboard props', function () {
    $superAdmin = User::factory()->superAdmin()->withTwoFactor()->create();
    actingAsVerifiedSuperAdmin($superAdmin);

    $dashboard = $this->get(route('super-admin.dashboard'))
        ->inertiaProps('dashboard');
    $serialized = json_encode($dashboard);

    expect($serialized)
        ->not->toContain('password')
        ->not->toContain('two_factor_secret')
        ->not->toContain('recovery_codes')
        ->not->toContain('ip_address')
        ->not->toContain('exception')
        ->not->toContain('assessment_notes');
});

it('never marks unconfigured health sources operational', function () {
    $superAdmin = User::factory()->superAdmin()->withTwoFactor()->create();
    actingAsVerifiedSuperAdmin($superAdmin);

    $health = $this->get(route('super-admin.dashboard'))
        ->inertiaProps('dashboard.health');

    expect(collect($health)
        ->whereIn('service', [
            'Queue processing',
            'Email delivery',
            'AI provider',
            'Malware scanning',
            'Backups',
        ])
        ->where('status', 'operational'))
        ->toBeEmpty();
});

it('securely logs out and records the administrative session end', function () {
    $superAdmin = User::factory()->superAdmin()->withTwoFactor()->create();
    actingAsVerifiedSuperAdmin($superAdmin);

    $this->post(route('super-admin.logout'))
        ->assertRedirect(route('super-admin.login'));

    $this->assertGuest();
    expect(SecurityEvent::query()
        ->where('user_id', $superAdmin->id)
        ->where('event_type', 'super_admin.session_ended')
        ->exists())->toBeTrue();
});
