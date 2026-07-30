<?php

use App\Models\SecurityEvent;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the restricted super admin login page for guests', function () {
    $this->get('/super-admin/login')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/auth/login')
        );

    $source = file_get_contents(
        resource_path('js/pages/super-admin/auth/login.tsx'),
    );

    expect($source)
        ->toContain('Super Admin Sign In')
        ->toContain('noindex, nofollow, noarchive')
        ->toContain('Email address')
        ->toContain('Password')
        ->toContain('Sign In Securely')
        ->not->toContain('name="role"')
        ->not->toContain('organization_id')
        ->not->toContain('Back to Home')
        ->not->toContain('Forgot password');
});

it('routes an eligible super admin to the portal-specific MFA challenge', function () {
    $user = User::factory()->superAdmin()->withTwoFactor()->create();

    $response = $this->post(route('super-admin.authenticate'), [
        'email' => mb_strtoupper($user->email),
        'password' => 'password',
    ]);

    $response
        ->assertRedirect(route('super-admin.two-factor.challenge'))
        ->assertSessionHas('super_admin.login.id', $user->id)
        ->assertSessionHas('super_admin.login.expires_at');
    $this->assertGuest();

    expect(SecurityEvent::query()->first())
        ->event_type->toBe('super_admin.mfa_challenge_issued')
        ->outcome->toBe('success');
});

it('completes MFA with an existing recovery code and creates the session', function () {
    $user = User::factory()->superAdmin()->withTwoFactor()->create();

    $this->post(route('super-admin.authenticate'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response = $this->post(route('super-admin.two-factor.authenticate'), [
        'recovery_code' => 'recovery-code-1',
    ]);

    $response->assertRedirect('/super-admin/dashboard');
    $this->assertAuthenticatedAs($user);
    $response
        ->assertSessionMissing('super_admin.login.id')
        ->assertSessionHas('super_admin.mfa_verified_at');

    expect(SecurityEvent::query()
        ->where('event_type', 'super_admin.session_created')
        ->first())
        ->context->toMatchArray(['recovery_code_used' => true]);
});

it('uses a generic response for invalid credentials and does not log secrets', function () {
    $user = User::factory()->superAdmin()->withTwoFactor()->create();
    $password = 'not-the-password';

    $response = $this->from('/super-admin/login')
        ->post(route('super-admin.authenticate'), [
            'email' => $user->email,
            'password' => $password,
        ]);

    $response
        ->assertRedirect('/super-admin/login')
        ->assertSessionHasErrors([
            'email' => 'We could not verify the provided credentials.',
        ]);
    $this->assertGuest();

    expect(SecurityEvent::query()->first())
        ->event_type->toBe('super_admin.login_rejected')
        ->user_id->toBeNull();
    expect(SecurityEvent::query()->first()->toJson())
        ->not->toContain($password)
        ->not->toContain($user->email);
});

it('rejects non-super-admin accounts with the same generic response', function () {
    $user = User::factory()->withTwoFactor()->create();

    $this->from('/super-admin/login')
        ->post(route('super-admin.authenticate'), [
            'email' => $user->email,
            'password' => 'password',
        ])
        ->assertSessionHasErrors([
            'email' => 'We could not verify the provided credentials.',
        ]);

    $this->assertGuest();
});

it('rejects unavailable super admin accounts', function (string $status) {
    $user = User::factory()
        ->superAdmin()
        ->withTwoFactor()
        ->withAccountStatus($status)
        ->create();

    $this->post(route('super-admin.authenticate'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasErrors([
        'email' => 'We could not verify the provided credentials.',
    ]);

    $this->assertGuest();
})->with(['disabled', 'archived', 'suspended', 'locked']);

it('requires configured MFA for super admin authentication', function () {
    $user = User::factory()->superAdmin()->create();

    $this->post(route('super-admin.authenticate'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasErrors([
        'email' => 'We could not verify the provided credentials.',
    ]);

    $this->assertGuest();
});

it('rejects invalid and expired MFA challenge state', function () {
    $user = User::factory()->superAdmin()->withTwoFactor()->create();

    $this->withSession([
        'super_admin.login.id' => $user->id,
        'super_admin.login.expires_at' => now()->subMinute()->timestamp,
    ])->get(route('super-admin.two-factor.challenge'))
        ->assertRedirect(route('super-admin.login'));

    $this->assertGuest();
});

it('rate limits the super admin login endpoint', function () {
    $email = 'admin@example.test';

    foreach (range(1, 5) as $attempt) {
        $this->post(route('super-admin.authenticate'), [
            'email' => $email,
            'password' => 'password',
        ]);
    }

    $response = $this->post(route('super-admin.authenticate'), [
        'email' => $email,
        'password' => 'password',
    ]);

    expect($response->getStatusCode())->toBe(429);
});

it('does not expose the super admin portal from public pages', function () {
    $publicSources = [
        file_get_contents(resource_path('js/pages/welcome.tsx')),
        file_get_contents(resource_path('js/pages/auth/login.tsx')),
    ];

    foreach ($publicSources as $source) {
        expect($source)
            ->not->toContain('/super-admin/login')
            ->not->toContain('Super Admin Sign In');
    }
});
