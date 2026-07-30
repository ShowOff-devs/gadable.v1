<?php

use App\Models\Organization;
use App\Models\OrganizationAdminDesignation;
use App\Models\OrganizationMembership;
use App\Models\OrganizationSubscription;
use App\Models\SecurityEvent;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    config()->set('organization-admin.mfa_required', true);
});

function eligibleOrganizationAdmin(int $organizationCount = 1): User
{
    $user = User::factory()->organizationAdmin()->withTwoFactor()->create();

    foreach (range(1, $organizationCount) as $index) {
        $organization = Organization::factory()->create([
            'account_status' => 'active',
            'onboarding_status' => 'approved',
            'identity_verified' => true,
            'authority_verified' => true,
            'primary_admin_ready' => true,
            'subscription_ready' => true,
            'security_ready' => true,
        ]);
        $membership = OrganizationMembership::factory()->create([
            'organization_id' => $organization,
            'user_id' => $user,
        ]);
        OrganizationAdminDesignation::factory()->create([
            'organization_membership_id' => $membership,
        ]);
        OrganizationSubscription::factory()->create([
            'organization_id' => $organization,
        ]);
    }

    return $user;
}

it('renders the organization admin login page for guests', function () {
    $this->get(route('organization-admin.login'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('organization-admin/auth/login')
            ->where('canResetPassword', true)
        );

    $source = file_get_contents(resource_path('js/pages/organization-admin/auth/login.tsx'));

    expect($source)
        ->toContain('Organization Admin Portal')
        ->toContain('Email address')
        ->toContain('Password')
        ->toContain('Forgot password?')
        ->toContain('Sign In Securely')
        ->not->toContain('name="role"')
        ->not->toContain('Register');
});

it('issues an MFA challenge only for an eligible organization admin', function () {
    $user = eligibleOrganizationAdmin();

    $this->post(route('organization-admin.login.store'), [
        'email' => mb_strtoupper($user->email),
        'password' => 'password',
    ])->assertRedirect(route('organization-admin.two-factor.challenge'))
        ->assertSessionHas('organization_admin.login.id', $user->id)
        ->assertSessionHas('organization_admin.login.expires_at');

    $this->assertGuest();
    expect(SecurityEvent::query()->first()->event_type)
        ->toBe('organization_admin.mfa_challenge_issued');
});

it('signs an eligible organization admin directly into the dashboard when MFA is disabled', function () {
    config()->set('organization-admin.mfa_required', false);
    $user = eligibleOrganizationAdmin();
    $organizationId = $user->organizationMemberships()->value('organization_id');

    $this->post(route('organization-admin.login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('organization-admin.dashboard'))
        ->assertSessionHas('organization_admin.organization_id', $organizationId)
        ->assertSessionMissing('organization_admin.login.id');

    $this->assertAuthenticatedAs($user);
    expect(SecurityEvent::query()->firstOrFail()->event_type)
        ->toBe('organization_admin.session_created');
});

it('completes MFA and resolves a single organization context', function () {
    $user = eligibleOrganizationAdmin();
    $organizationId = $user->organizationMemberships()->value('organization_id');

    $this->post(route('organization-admin.login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->post(route('organization-admin.two-factor.authenticate'), [
        'recovery_code' => 'recovery-code-1',
    ])->assertRedirect(route('organization-admin.dashboard'))
        ->assertSessionHas('organization_admin.organization_id', $organizationId)
        ->assertSessionHas('organization_admin.mfa_verified_at');

    $this->assertAuthenticatedAs($user);
});

it('uses the same generic response for invalid credentials and wrong portal roles', function (User $user) {
    $response = $this->from(route('organization-admin.login'))
        ->post(route('organization-admin.login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

    $response->assertSessionHasErrors([
        'email' => 'We could not sign you in with those credentials. Check your details or contact your authorized administrator.',
    ]);
    $this->assertGuest();
})->with([
    'general user' => fn () => User::factory()->create(),
    'super admin' => fn () => User::factory()->superAdmin()->withTwoFactor()->create(),
]);

it('rejects invalid credentials without logging the password or email', function () {
    $user = eligibleOrganizationAdmin();
    $password = 'not-the-password';

    $this->post(route('organization-admin.login.store'), [
        'email' => $user->email,
        'password' => $password,
    ])->assertSessionHasErrors('email');

    $event = SecurityEvent::query()->firstOrFail();
    expect($event->user_id)->toBeNull()
        ->and($event->toJson())->not->toContain($password)
        ->not->toContain($user->email);
});

it('denies inactive accounts and invalid designations', function (string $condition) {
    $user = eligibleOrganizationAdmin();

    match ($condition) {
        'account suspended' => $user->update(['account_status' => 'suspended']),
        'email unverified' => $user->forceFill(['email_verified_at' => null])->save(),
        'designation pending' => $user->organizationMemberships->firstOrFail()
            ->adminDesignations()->update(['status' => 'pending']),
        'designation future' => $user->organizationMemberships->firstOrFail()
            ->adminDesignations()->update(['effective_at' => now()->addDay()]),
        'designation expired' => $user->organizationMemberships->firstOrFail()
            ->adminDesignations()->update(['expires_at' => now()->subDay()]),
        'designation revoked' => $user->organizationMemberships->firstOrFail()
            ->adminDesignations()->update(['revoked_at' => now()]),
    };

    $this->post(route('organization-admin.login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
})->with([
    'account suspended',
    'email unverified',
    'designation pending',
    'designation future',
    'designation expired',
    'designation revoked',
]);

it('denies inactive organizations', function (array $organizationState) {
    $user = eligibleOrganizationAdmin();
    Organization::query()->update($organizationState);

    $this->post(route('organization-admin.login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');
})->with([
    'suspended' => [['account_status' => 'suspended']],
    'archived' => [['account_status' => 'archived']],
    'terminated' => [['account_status' => 'terminated']],
]);

it('shows only authorized organizations and rejects a manipulated selection', function () {
    $user = eligibleOrganizationAdmin(2);
    $unauthorizedOrganization = Organization::factory()->create(['account_status' => 'active', 'subscription_ready' => true]);

    $this->actingAs($user)
        ->withSession(['organization_admin.mfa_verified_at' => now()->timestamp])
        ->get(route('organization-admin.organizations.select'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('organization-admin/select-organization')
            ->has('organizations', 2)
        );

    $this->post(route('organization-admin.organizations.store'), [
        'organization_id' => $unauthorizedOrganization->id,
    ])->assertSessionHasErrors('organization_id');
});

it('revalidates designation and organization status on protected requests', function () {
    $user = eligibleOrganizationAdmin();
    $organizationId = $user->organizationMemberships()->value('organization_id');

    $this->actingAs($user)
        ->withSession([
            'organization_admin.mfa_verified_at' => now()->timestamp,
            'organization_admin.organization_id' => $organizationId,
        ]);

    OrganizationAdminDesignation::query()->update(['revoked_at' => now()]);

    $this->get(route('organization-admin.dashboard'))
        ->assertRedirect(route('organization-admin.login'));
    $this->assertGuest();
});

it('rate limits organization admin login attempts', function () {
    foreach (range(1, 5) as $attempt) {
        $this->post(route('organization-admin.login.store'), [
            'email' => 'admin@example.test',
            'password' => 'password',
        ]);
    }

    $this->post(route('organization-admin.login.store'), [
        'email' => 'admin@example.test',
        'password' => 'password',
    ])->assertTooManyRequests();
});

it('invalidates the authenticated session on logout', function () {
    $user = eligibleOrganizationAdmin();
    $organizationId = $user->organizationMemberships()->value('organization_id');

    $this->actingAs($user)
        ->withSession([
            'organization_admin.mfa_verified_at' => now()->timestamp,
            'organization_admin.organization_id' => $organizationId,
        ])
        ->post(route('organization-admin.logout'))
        ->assertRedirect(route('organization-admin.login'));

    $this->assertGuest();
});

it('renders the tenant-scoped organization dashboard contract', function () {
    $user = eligibleOrganizationAdmin();
    $organization = $user->organizationMemberships()->firstOrFail()->organization;

    $this->actingAs($user)
        ->withSession([
            'organization_admin.mfa_verified_at' => now()->timestamp,
            'organization_admin.organization_id' => $organization->id,
        ])
        ->get(route('organization-admin.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('organization-admin/dashboard')
            ->where('organization.id', $organization->id)
            ->where('organization.official_name', $organization->official_name)
            ->where('organization.code', $organization->code)
            ->where('dashboard', null)
            ->where('previewMode', false)
        );
});

it('does not expose an unauthorized organization through dashboard session manipulation', function () {
    $user = eligibleOrganizationAdmin();
    $unauthorizedOrganization = Organization::factory()->create([
        'account_status' => 'active',
        'subscription_ready' => true,
    ]);

    $this->actingAs($user)
        ->withSession([
            'organization_admin.mfa_verified_at' => now()->timestamp,
            'organization_admin.organization_id' => $unauthorizedOrganization->id,
        ])
        ->get(route('organization-admin.dashboard'))
        ->assertRedirect(route('organization-admin.organizations.select'));
});

it('keeps organization dashboard actions within administrative authority', function () {
    $source = file_get_contents(
        resource_path('js/pages/organization-admin/dashboard.tsx'),
    );
    $fixture = file_get_contents(
        resource_path('js/data/organization-admin-dashboard-preview.ts'),
    );

    expect($source)
        ->toContain('Organization Dashboard')
        ->toContain('Priority Work Queue')
        ->toContain('PAP Financial Summary')
        ->toContain('Subscription and Platform Usage')
        ->toContain('Data unavailable')
        ->toContain('import.meta.env.DEV')
        ->not->toContain('Score PAP')
        ->not->toContain('Approve PAP')
        ->not->toContain('Decline PAP')
        ->and($fixture)
        ->toContain('Development preview:')
        ->not->toContain('production');
});
