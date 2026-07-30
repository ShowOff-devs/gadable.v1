<?php

use App\Models\Organization;
use App\Models\OrganizationSubscription;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanEvent;
use App\Models\SubscriptionPlanVersion;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->withTwoFactor()->create();
});

function asSubscriptionSuperAdmin(User $user): void
{
    test()->actingAs($user)->withSession([
        'super_admin.mfa_verified_at' => now()->timestamp,
    ]);
}

function validPlanPayload(array $overrides = []): array
{
    return [
        'family' => 'Agency and Institution',
        'name' => 'Agency Professional',
        'code' => 'AGENCY-PROFESSIONAL',
        'description' => 'Indicative annual institutional plan.',
        'intended_customer_type' => 'Government agency',
        'deployment_scope' => 'Single organization',
        'version_number' => 1,
        'billing_cycle' => 'annual',
        'currency' => 'PHP',
        'implementation_amount' => '224000.00',
        'recurring_amount' => '672000.00',
        'renewal_amount' => '672000.00',
        'vat_rate' => '12.00',
        'vat_inclusive' => true,
        'grace_period_days' => 0,
        'effective_from' => '2026-08-01',
        'change_summary' => 'Initial approved commercial configuration draft.',
        'limits' => [
            'named_users' => ['state' => 'limited', 'value' => 40, 'unit' => 'count', 'period' => 'term'],
            'storage_bytes' => ['state' => 'limited', 'value' => 107374182400, 'unit' => 'bytes', 'period' => 'term'],
        ],
        'entitlements' => [
            'pap_repository' => ['state' => 'included', 'limit' => null],
            'advanced_analytics' => ['state' => 'included', 'limit' => null],
        ],
        'support_configuration' => [
            'tier' => 'priority',
            'training_sessions' => 3,
            'administrator_orientation' => true,
            'system_health_review' => true,
            'hosting_included' => true,
            'backups_included' => true,
            'maintenance_included' => true,
            'product_updates' => true,
            'email_support' => true,
            'priority_support' => true,
        ],
        ...$overrides,
    ];
}

it('protects every platform subscription route', function () {
    $subscription = OrganizationSubscription::factory()->create();

    $this->get(route('super-admin.subscriptions.index'))
        ->assertRedirect(route('super-admin.login'));
    $this->get(route('super-admin.subscription-plans.index'))
        ->assertRedirect(route('super-admin.login'));
    $this->get(route('super-admin.subscription-plans.create'))
        ->assertRedirect(route('super-admin.login'));
    $this->get(route('super-admin.subscriptions.show', $subscription))
        ->assertRedirect(route('super-admin.login'));

    $organizationAdmin = User::factory()->organizationAdmin()->withTwoFactor()->create();
    asSubscriptionSuperAdmin($organizationAdmin);
    $this->get(route('super-admin.subscriptions.index'))
        ->assertForbidden();
});

it('renders confirmed summary counts and keeps unavailable recurring value distinct from zero', function () {
    OrganizationSubscription::factory()->create(['status' => 'active']);
    OrganizationSubscription::factory()->create(['status' => 'trial']);
    OrganizationSubscription::factory()->create(['status' => 'grace']);
    asSubscriptionSuperAdmin($this->superAdmin);

    $this->get(route('super-admin.subscriptions.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/subscriptions/index')
            ->where('counts.active', 1)
            ->where('counts.trial', 1)
            ->where('counts.grace', 1)
            ->where('counts.recurringAnnualValue', null)
            ->where('counts.recurringAnnualValueAvailable', false)
            ->where('timezone', config('app.timezone'))
        );
});

it('supports server-side subscription search and filters with pagination preservation', function () {
    $plan = SubscriptionPlan::factory()->create(['name' => 'Agency Professional']);
    $version = SubscriptionPlanVersion::factory()->published()->create([
        'subscription_plan_id' => $plan->id,
    ]);
    $target = OrganizationSubscription::factory()->create([
        'subscription_plan_version_id' => $version->id,
        'status' => 'active',
        'contract_status' => 'confirmed',
    ]);
    OrganizationSubscription::factory()->count(15)->create();
    asSubscriptionSuperAdmin($this->superAdmin);

    $this->get(route('super-admin.subscriptions.index', [
        'search' => $target->organization->code,
        'status' => 'active',
        'plan' => $plan->id,
        'contract_status' => 'confirmed',
    ]))->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('subscriptions.data', 1)
            ->where('subscriptions.data.0.reference', $target->reference)
            ->where('subscriptions.data.0.plan.name', 'Agency Professional')
            ->where('subscriptions.data.0.plan.version', 1)
            ->where('filters.status', 'active')
        );
});

it('keeps standard and agreed commercial amounts separate from PAP finance', function () {
    $version = SubscriptionPlanVersion::factory()->published()->create([
        'implementation_amount' => '224000.00',
        'recurring_amount' => '672000.00',
    ]);
    $subscription = OrganizationSubscription::factory()->create([
        'subscription_plan_version_id' => $version->id,
        'agreed_implementation_amount' => '200000.00',
        'agreed_recurring_amount' => '650000.00',
        'payment_confirmation_reference' => null,
    ]);
    asSubscriptionSuperAdmin($this->superAdmin);

    $this->get(route('super-admin.subscriptions.show', $subscription))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/subscriptions/show')
            ->where('subscription.standardImplementationAmount', '224000.00')
            ->where('subscription.standardRecurringAmount', '672000.00')
            ->where('subscription.agreedImplementationAmount', '200000.00')
            ->where('subscription.agreedRecurringAmount', '650000.00')
            ->where('subscription.paymentConfirmationReference', null)
        );

    expect((new OrganizationSubscription)->getTable())->not->toBe('pap_financial_summaries');
});

it('shows retired plan versions with historical assignment counts', function () {
    $plan = SubscriptionPlan::factory()->create();
    $version = SubscriptionPlanVersion::factory()->published()->create([
        'subscription_plan_id' => $plan->id,
    ]);
    OrganizationSubscription::factory()->create([
        'subscription_plan_version_id' => $version->id,
    ]);
    $version->update(['status' => 'retired', 'retired_at' => now()]);
    asSubscriptionSuperAdmin($this->superAdmin);

    $this->get(route('super-admin.subscription-plans.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/subscriptions/plans')
            ->where('plans.data.0.versions.0.status', 'retired')
            ->where('plans.data.0.versions.0.immutable', true)
            ->where('plans.data.0.versions.0.subscriptionsCount', 1)
        );
});

it('prevents changes to published and retired plan versions', function (string $status) {
    $version = SubscriptionPlanVersion::factory()->create([
        'status' => $status,
        'published_at' => now(),
        'retired_at' => $status === 'retired' ? now() : null,
    ]);

    expect(fn () => $version->update(['recurring_amount' => '1.00']))
        ->toThrow(LogicException::class, 'immutable');
})->with(['published', 'retired']);

it('allows draft versions to change without altering an existing published version', function () {
    $plan = SubscriptionPlan::factory()->create();
    $published = SubscriptionPlanVersion::factory()->published()->create([
        'subscription_plan_id' => $plan->id,
        'version_number' => 1,
        'recurring_amount' => '336000.00',
    ]);
    $draft = SubscriptionPlanVersion::factory()->create([
        'subscription_plan_id' => $plan->id,
        'version_number' => 2,
        'recurring_amount' => '400000.00',
    ]);

    $draft->update(['recurring_amount' => '420000.00']);

    expect($draft->fresh()->recurring_amount)->toBe('420000.00')
        ->and($published->fresh()->recurring_amount)->toBe('336000.00');
});

it('creates a stable plan and its initial draft version transactionally', function () {
    asSubscriptionSuperAdmin($this->superAdmin);

    $this->post(route('super-admin.subscription-plans.store'), validPlanPayload())
        ->assertRedirect();

    $plan = SubscriptionPlan::sole();
    $version = $plan->versions()->sole();

    expect($plan->code)->toBe('AGENCY-PROFESSIONAL')
        ->and($version->status->value)->toBe('draft')
        ->and($version->recurring_amount)->toBe('672000.00')
        ->and($version->limits['named_users']['value'])->toBe(40)
        ->and(SubscriptionPlanEvent::where('action', 'subscription_plan.created')->exists())->toBeTrue();
});

it('rejects duplicate codes, negative prices, and unknown entitlement keys', function () {
    SubscriptionPlan::factory()->create(['code' => 'AGENCY-PROFESSIONAL']);
    asSubscriptionSuperAdmin($this->superAdmin);

    $this->post(route('super-admin.subscription-plans.store'), validPlanPayload([
        'recurring_amount' => '-1.00',
        'entitlements' => ['unknown_feature' => ['state' => 'included', 'limit' => null]],
    ]))->assertSessionHasErrors(['code', 'recurring_amount', 'entitlements']);
});

it('requires successful validation before publishing and records an immutable event', function () {
    $version = SubscriptionPlanVersion::factory()->create();
    $plan = $version->plan;
    asSubscriptionSuperAdmin($this->superAdmin);

    $this->post(route('super-admin.subscription-plan-versions.publish', [$plan, $version]), [
        'reason' => 'Approved for publication after governance review.',
        'lock_version' => 1,
    ])->assertSessionHasErrors('publication');

    $this->post(route('super-admin.subscription-plan-versions.validate', [$plan, $version]))
        ->assertRedirect();
    $version->refresh();

    $this->post(route('super-admin.subscription-plan-versions.publish', [$plan, $version]), [
        'reason' => 'Approved for publication after governance review.',
        'lock_version' => $version->lock_version,
    ])->assertRedirect();

    expect($version->fresh()->status->value)->toBe('published')
        ->and($version->fresh()->snapshot_checksum)->toHaveLength(64)
        ->and(SubscriptionPlanEvent::where('action', 'subscription_plan_version.published')->exists())->toBeTrue();
});

it('clones an immutable version without changing it or migrating subscriptions', function () {
    $source = SubscriptionPlanVersion::factory()->published()->create([
        'version_number' => 1,
        'recurring_amount' => '672000.00',
    ]);
    $subscription = OrganizationSubscription::factory()->create([
        'subscription_plan_version_id' => $source->id,
    ]);
    asSubscriptionSuperAdmin($this->superAdmin);

    $this->post(route('super-admin.subscription-plan-versions.clone', [$source->plan, $source]), [
        'version_number' => 2,
        'change_summary' => 'Prepare updated limits for the next commercial period.',
        'reason' => 'Approved creation of a successor draft version.',
    ])->assertRedirect();

    $clone = SubscriptionPlanVersion::where('version_number', 2)->sole();
    expect($clone->status->value)->toBe('draft')
        ->and($clone->recurring_amount)->toBe('672000.00')
        ->and($source->fresh()->status->value)->toBe('published')
        ->and($subscription->fresh()->subscription_plan_version_id)->toBe($source->id);
});

it('prevents assigning draft and retired versions to new organization subscriptions', function (string $status) {
    $version = SubscriptionPlanVersion::factory()->create([
        'status' => $status,
        'published_at' => $status === 'retired' ? now()->subMonth() : null,
        'retired_at' => $status === 'retired' ? now() : null,
    ]);

    expect(fn () => OrganizationSubscription::factory()->create([
        'subscription_plan_version_id' => $version->id,
    ]))->toThrow(LogicException::class, 'Only a published plan version');
})->with(['draft', 'retired']);

it('renders explicit unavailable, immutable, and data-preservation language', function () {
    $index = file_get_contents(resource_path('js/pages/super-admin/subscriptions/index.tsx'));
    $plans = file_get_contents(resource_path('js/pages/super-admin/subscriptions/plans.tsx'));
    $show = file_get_contents(resource_path('js/pages/super-admin/subscriptions/show.tsx'));

    expect($index)
        ->toContain('Unavailable')
        ->toContain('Not derived from PAP budgets')
        ->and($plans)
        ->toContain('publish immutable commercial')
        ->toContain('Create your first plan')
        ->and($show)
        ->toContain('Tenant records and audit history remain')
        ->toContain('preserved.')
        ->toContain('does not process')
        ->toContain('payments or maintain an accounting ledger');
});

it('uses the globally resolved Super Admin layout only once', function () {
    foreach ([
        resource_path('js/pages/super-admin/subscriptions/index.tsx'),
        resource_path('js/pages/super-admin/subscriptions/plans.tsx'),
        resource_path('js/pages/super-admin/subscriptions/show.tsx'),
    ] as $page) {
        expect(file_get_contents($page))
            ->not->toContain("import SuperAdminLayout")
            ->not->toContain('<SuperAdminLayout>');
    }
});
