<?php

use App\Models\Organization;
use App\Models\OrganizationAdminDesignation;
use App\Models\OrganizationMembership;
use App\Models\SecurityEvent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

function actingAsUserAccessSuperAdmin(User $user): void
{
    test()->actingAs($user)->withSession([
        'super_admin.mfa_verified_at' => now()->timestamp,
    ]);
}

it('protects the user access directory and detail routes', function () {
    $user = User::factory()->create();

    $this->get(route('super-admin.users.index'))
        ->assertRedirect(route('super-admin.login'));
    $this->get(route('super-admin.users.show', $user))
        ->assertRedirect(route('super-admin.login'));
});

it('forbids non-super-admin and inactive administrative accounts', function () {
    $standard = User::factory()->create();
    $inactive = User::factory()->superAdmin()->withTwoFactor()->withAccountStatus('suspended')->create();

    $this->actingAs($standard)
        ->withSession(['super_admin.mfa_verified_at' => now()->timestamp])
        ->get(route('super-admin.users.index'))
        ->assertForbidden();
    $this->actingAs($inactive)
        ->withSession(['super_admin.mfa_verified_at' => now()->timestamp])
        ->get(route('super-admin.users.index'))
        ->assertForbidden();
});

it('requires a completed super admin MFA session', function () {
    $superAdmin = User::factory()->superAdmin()->withTwoFactor()->create();

    $this->actingAs($superAdmin)
        ->get(route('super-admin.users.index'))
        ->assertRedirect(route('super-admin.login'));
    $this->assertGuest();
});

it('renders real user, membership, security, and session summaries', function () {
    $superAdmin = User::factory()->superAdmin()->withTwoFactor()->create();
    $organizationAdmin = User::factory()->organizationAdmin()->withTwoFactor()->create();
    $organization = Organization::factory()->create(['created_by' => $superAdmin]);
    $membership = OrganizationMembership::factory()->create([
        'user_id' => $organizationAdmin,
        'organization_id' => $organization,
    ]);
    OrganizationAdminDesignation::factory()->create([
        'organization_membership_id' => $membership,
        'expires_at' => now()->addDays(10),
    ]);
    DB::table('sessions')->insert([
        'id' => 'safe-test-session',
        'user_id' => $organizationAdmin->id,
        'ip_address' => '192.0.2.1',
        'user_agent' => 'Private browser details',
        'payload' => 'private-payload',
        'last_activity' => now()->timestamp,
    ]);
    SecurityEvent::create([
        'user_id' => $organizationAdmin->id,
        'event_type' => 'organization_admin.session_created',
        'outcome' => 'success',
        'ip_address' => '192.0.2.1',
        'user_agent' => 'Private browser details',
        'context' => ['private' => 'payload'],
    ]);
    actingAsUserAccessSuperAdmin($superAdmin);

    $this->get(route('super-admin.users.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/users/index')
            ->where('summary.total', 2)
            ->where('summary.activeSessions', 1)
            ->where('summary.expiringDesignations', 1)
            ->has('users.data', 2)
        );
});

it('filters users on the server and preserves query parameters', function () {
    $superAdmin = User::factory()->superAdmin()->withTwoFactor()->create();
    $organization = Organization::factory()->create();
    $matching = User::factory()->organizationAdmin()->withTwoFactor()->create([
        'name' => 'Matching Administrator',
        'account_status' => 'active',
    ]);
    OrganizationMembership::factory()->create([
        'user_id' => $matching,
        'organization_id' => $organization,
    ]);
    User::factory()->create(['name' => 'Different Person']);
    actingAsUserAccessSuperAdmin($superAdmin);

    $this->get(route('super-admin.users.index', [
        'search' => 'Matching',
        'organization' => $organization->id,
        'account_type' => 'organization_admin',
        'status' => 'active',
        'verification' => 'verified',
        'mfa' => 'enrolled',
    ]))->assertInertia(fn (Assert $page) => $page
        ->has('users.data', 1)
        ->where('users.data.0.name', 'Matching Administrator')
        ->where('filters.organization', (string) $organization->id)
    );
});

it('renders memberships and designations independently on user detail', function () {
    $superAdmin = User::factory()->superAdmin()->withTwoFactor()->create();
    $user = User::factory()->organizationAdmin()->withTwoFactor()->create();
    foreach (range(1, 2) as $position) {
        $membership = OrganizationMembership::factory()->create([
            'user_id' => $user,
            'organization_id' => Organization::factory(),
        ]);
        OrganizationAdminDesignation::factory()->create([
            'organization_membership_id' => $membership,
            'status' => $position === 1 ? 'active' : 'revoked',
        ]);
    }
    actingAsUserAccessSuperAdmin($superAdmin);

    $this->get(route('super-admin.users.show', $user))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/users/show')
            ->has('user.memberships', 2)
            ->has('user.memberships.0.designations', 1)
            ->where('availability.securityActions', false)
            ->where('availability.qualifications', false)
        );
});

it('never exposes credentials session identifiers or raw security payloads', function () {
    $superAdmin = User::factory()->superAdmin()->withTwoFactor()->create();
    $user = User::factory()->withTwoFactor()->create();
    DB::table('sessions')->insert([
        'id' => 'secret-session-identifier',
        'user_id' => $user->id,
        'ip_address' => '192.0.2.99',
        'user_agent' => 'Private User Agent',
        'payload' => 'secret-session-payload',
        'last_activity' => now()->timestamp,
    ]);
    SecurityEvent::create([
        'user_id' => $user->id,
        'event_type' => 'authentication.failure',
        'outcome' => 'failure',
        'ip_address' => '192.0.2.99',
        'user_agent' => 'Private User Agent',
        'context' => ['token' => 'private-event-token'],
    ]);
    actingAsUserAccessSuperAdmin($superAdmin);

    $serialized = json_encode($this->get(route('super-admin.users.show', $user))->inertiaProps());

    expect($serialized)
        ->not->toContain('password')
        ->not->toContain('two_factor_secret')
        ->not->toContain('recovery_codes')
        ->not->toContain('secret-session-identifier')
        ->not->toContain('secret-session-payload')
        ->not->toContain('192.0.2.99')
        ->not->toContain('Private User Agent')
        ->not->toContain('private-event-token');
});

it('does not provide evaluation approval impersonation or fake security actions', function () {
    $index = file_get_contents(resource_path('js/pages/super-admin/users/index.tsx'));
    $show = file_get_contents(resource_path('js/pages/super-admin/users/show.tsx'));

    expect($index.$show)
        ->not->toContain('Impersonate')
        ->not->toContain('Approve PAP')
        ->not->toContain('Evaluate PAP')
        ->not->toContain('temporary password')
        ->toContain('Security actions unavailable');
});
