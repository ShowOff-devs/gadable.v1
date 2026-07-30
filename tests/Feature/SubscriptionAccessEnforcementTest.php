<?php

use App\Actions\Subscriptions\ResolveOrganizationSubscriptionAccess;
use App\Models\Organization;
use App\Models\OrganizationAdminDesignation;
use App\Models\OrganizationMembership;
use App\Models\OrganizationSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::post('/test/organization-subscription-write', fn () => response()->json(['written' => true]))
        ->middleware(['web', 'organization-admin', 'organization-subscription', 'organization-subscription-write'])
        ->name('test.organization-subscription-write');
});

function subscriptionAccessAdmin(string $status = 'active'): array
{
    $user = User::factory()->organizationAdmin()->withTwoFactor()->create();
    $organization = Organization::factory()->create([
        'account_status' => 'active',
        'onboarding_status' => 'approved',
        'subscription_ready' => true,
    ]);
    $membership = OrganizationMembership::factory()->create([
        'organization_id' => $organization,
        'user_id' => $user,
    ]);
    OrganizationAdminDesignation::factory()->create([
        'organization_membership_id' => $membership,
    ]);
    $subscription = OrganizationSubscription::factory()->create([
        'organization_id' => $organization,
        'status' => $status,
        'ends_on' => now()->addMonth(),
        'grace_ends_on' => $status === 'grace' ? now()->addWeek() : null,
    ]);

    return [$user, $organization, $subscription];
}

it('does not treat onboarding subscription readiness as an active subscription', function () {
    $organization = Organization::factory()->create([
        'account_status' => 'active',
        'subscription_ready' => true,
    ]);

    $access = app(ResolveOrganizationSubscriptionAccess::class)->handle($organization);

    expect($access->canAccess)->toBeFalse()
        ->and($access->canWrite)->toBeFalse()
        ->and($access->reasonCode)->toBe('subscription_missing');
});

it('resolves subscribed access by lifecycle status', function (string $status, bool $canAccess, bool $canWrite) {
    [, $organization] = subscriptionAccessAdmin($status);

    $access = app(ResolveOrganizationSubscriptionAccess::class)->handle($organization);

    expect($access->lifecycleStatus?->value)->toBe($status)
        ->and($access->canAccess)->toBe($canAccess)
        ->and($access->canWrite)->toBe($canWrite);
})->with([
    'trial' => ['trial', true, true],
    'active' => ['active', true, true],
    'grace' => ['grace', true, true],
    'read only' => ['read_only', true, false],
    'suspended' => ['suspended', false, false],
    'draft' => ['draft', false, false],
    'expired' => ['expired', false, false],
    'cancelled' => ['cancelled', false, false],
    'terminated' => ['terminated', false, false],
]);

it('allows an active subscription even when the onboarding readiness flag is false', function () {
    [, $organization] = subscriptionAccessAdmin('active');
    $organization->update(['subscription_ready' => false]);

    $access = app(ResolveOrganizationSubscriptionAccess::class)->handle($organization);

    expect($access->canAccess)->toBeTrue()
        ->and($access->canWrite)->toBeTrue();
});

it('denies scheduled subscriptions before their effective date', function () {
    [, $organization, $subscription] = subscriptionAccessAdmin('scheduled');
    $subscription->update(['starts_on' => now()->addDay()]);

    $access = app(ResolveOrganizationSubscriptionAccess::class)->handle($organization);

    expect($access->canAccess)->toBeFalse()
        ->and($access->reasonCode)->toBe('subscription_not_started');
});

it('rejects direct organization writes while subscription access is read only', function () {
    [$user, $organization] = subscriptionAccessAdmin('read_only');

    $this->actingAs($user)
        ->withSession([
            'organization_admin.mfa_verified_at' => now()->timestamp,
            'organization_admin.organization_id' => $organization->id,
        ])
        ->postJson('/test/organization-subscription-write')
        ->assertForbidden()
        ->assertJsonPath('code', 'subscription_read_only')
        ->assertJsonPath('subscription_status', 'read_only')
        ->assertJsonStructure(['message', 'permitted_actions', 'request_reference']);
});

it('allows subscribed writes through the centralized guard', function () {
    [$user, $organization] = subscriptionAccessAdmin('active');

    $this->actingAs($user)
        ->withSession([
            'organization_admin.mfa_verified_at' => now()->timestamp,
            'organization_admin.organization_id' => $organization->id,
        ])
        ->postJson('/test/organization-subscription-write')
        ->assertSuccessful()
        ->assertJson(['written' => true]);
});

it('cannot switch to a suspended organization to bypass subscription enforcement', function () {
    [$user, $activeOrganization] = subscriptionAccessAdmin('active');
    $suspendedOrganization = Organization::factory()->create(['account_status' => 'active']);
    $membership = OrganizationMembership::factory()->create([
        'organization_id' => $suspendedOrganization,
        'user_id' => $user,
    ]);
    OrganizationAdminDesignation::factory()->create(['organization_membership_id' => $membership]);
    OrganizationSubscription::factory()->create([
        'organization_id' => $suspendedOrganization,
        'status' => 'suspended',
    ]);

    $this->actingAs($user)
        ->withSession([
            'organization_admin.mfa_verified_at' => now()->timestamp,
            'organization_admin.organization_id' => $suspendedOrganization->id,
        ])
        ->get(route('organization-admin.dashboard'))
        ->assertRedirect(route('organization-admin.organizations.select'));

    expect(Organization::query()->find($activeOrganization->id))->not->toBeNull()
        ->and(Organization::query()->find($suspendedOrganization->id))->not->toBeNull();
});
