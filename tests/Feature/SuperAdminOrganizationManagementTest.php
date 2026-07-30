<?php

use App\Enums\OrganizationOnboardingStatus;
use App\Enums\OrganizationStatus;
use App\Models\Organization;
use App\Models\OrganizationEvent;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->superAdmin = User::factory()->superAdmin()->withTwoFactor()->create();
});

function asOrganizationAdmin(User $user): void
{
    test()->actingAs($user)->withSession(['super_admin.mfa_verified_at' => now()->timestamp]);
}

it('protects every organization management entry point', function () {
    $organization = Organization::factory()->create();
    $this->get(route('super-admin.organizations.index'))->assertRedirect(route('super-admin.login'));
    $this->get(route('super-admin.organizations.create'))->assertRedirect(route('super-admin.login'));
    $this->get(route('super-admin.organizations.show', $organization))->assertRedirect(route('super-admin.login'));
    $this->get(route('super-admin.organizations.edit', $organization))->assertRedirect(route('super-admin.login'));
});

it('registers a normalized draft organization and audit event', function () {
    asOrganizationAdmin($this->superAdmin);
    $this->post(route('super-admin.organizations.store'), [
        'official_name' => 'Department of Inclusive Services',
        'code' => '  gad-001 ',
        'email' => 'office@example.gov.ph',
        'data_classification' => 'internal',
    ])->assertRedirect();

    $organization = Organization::sole();
    expect($organization->code)->toBe('GAD-001')
        ->and($organization->onboarding_status)->toBe(OrganizationOnboardingStatus::Draft)
        ->and($organization->account_status)->toBe(OrganizationStatus::PendingActivation)
        ->and(OrganizationEvent::where('action', 'organization.created')->exists())->toBeTrue();
});

it('requires explicit confirmation for a probable duplicate organization', function () {
    Organization::factory()->create([
        'official_name' => 'Regional Inclusion Office',
        'email' => 'official@example.gov.ph',
    ]);
    asOrganizationAdmin($this->superAdmin);

    $payload = [
        'official_name' => 'regional inclusion office',
        'code' => 'RIO-NEW',
        'email' => 'official@example.gov.ph',
        'data_classification' => 'internal',
    ];

    $this->post(route('super-admin.organizations.store'), $payload)
        ->assertSessionHasErrors('confirm_duplicate');
    expect(Organization::count())->toBe(1);

    $this->post(route('super-admin.organizations.store'), [
        ...$payload,
        'confirm_duplicate' => true,
    ])->assertRedirect();
    expect(Organization::count())->toBe(2);
});

it('supports server-side search and lifecycle filters', function () {
    Organization::factory()->create(['official_name' => 'Alpha Office', 'account_status' => OrganizationStatus::Active]);
    Organization::factory()->create(['official_name' => 'Beta Office']);
    asOrganizationAdmin($this->superAdmin);
    $this->get(route('super-admin.organizations.index', ['search' => 'Alpha', 'status' => 'active']))
        ->assertInertia(fn (Assert $page) => $page->component('super-admin/organizations/index')->has('organizations.data', 1)->where('organizations.data.0.officialName', 'Alpha Office'));
});

it('renders the edit page and updates through the named route', function () {
    $organization = Organization::factory()->create();
    asOrganizationAdmin($this->superAdmin);

    $this->get(route('super-admin.organizations.edit', $organization))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/organizations/edit')
            ->where('organization.id', $organization->id)
            ->where('organization.lock_version', 1)
        );

    $this->put(route('super-admin.organizations.update', $organization), [
        'official_name' => 'Updated Organization Name',
        'code' => $organization->code,
        'data_classification' => 'standard',
        'lock_version' => 1,
    ])->assertRedirect(route('super-admin.organizations.show', $organization));

    expect($organization->fresh()->official_name)->toBe('Updated Organization Name');
});

it('supports authoritative filters, sorting, and pagination query preservation', function () {
    Organization::factory()->count(16)->create([
        'organization_type' => 'Regional Office',
        'region_name' => 'Region XI',
        'data_classification' => 'internal',
    ]);
    asOrganizationAdmin($this->superAdmin);

    $response = $this->get(route('super-admin.organizations.index', [
        'type' => 'Regional Office',
        'region' => 'Region XI',
        'classification' => 'internal',
        'sort' => 'newest',
    ]));

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('organizations.data', 15)
            ->where('filters.type', 'Regional Office')
            ->where('filters.region', 'Region XI')
            ->where('organizations.links.1.url', fn (string $url) => str_contains($url, 'region=Region%20XI'))
        );
});

it('rejects self-parenting and hierarchy cycles', function () {
    $parent = Organization::factory()->create();
    $child = Organization::factory()->create(['parent_id' => $parent->id]);
    asOrganizationAdmin($this->superAdmin);
    $payload = ['official_name' => $parent->official_name, 'code' => $parent->code, 'data_classification' => 'standard', 'parent_id' => $child->id, 'lock_version' => $parent->lock_version];
    $this->put(route('super-admin.organizations.update', $parent), $payload)->assertSessionHasErrors('parent_id');
    expect($parent->fresh()->parent_id)->toBeNull();
});

it('enforces optimistic locking when updating records', function () {
    $organization = Organization::factory()->create(['lock_version' => 3]);
    asOrganizationAdmin($this->superAdmin);
    $this->put(route('super-admin.organizations.update', $organization), ['official_name' => 'Changed', 'code' => $organization->code, 'data_classification' => 'standard', 'lock_version' => 2])->assertSessionHasErrors('lock_version');
});

it('requires and audits a reason for active hierarchy changes', function () {
    $parent = Organization::factory()->create();
    $organization = Organization::factory()->create([
        'account_status' => OrganizationStatus::Active,
    ]);
    asOrganizationAdmin($this->superAdmin);
    $payload = [
        'official_name' => $organization->official_name,
        'code' => $organization->code,
        'data_classification' => 'standard',
        'parent_id' => $parent->id,
        'lock_version' => 1,
    ];

    $this->put(route('super-admin.organizations.update', $organization), $payload)
        ->assertSessionHasErrors('hierarchy_reason');

    $this->put(route('super-admin.organizations.update', $organization), [
        ...$payload,
        'hierarchy_reason' => 'Approved governance realignment.',
    ])->assertRedirect();

    expect($organization->fresh()->parent_id)->toBe($parent->id)
        ->and(OrganizationEvent::where('reason', 'Approved governance realignment.')->exists())->toBeTrue();
});

it('only exposes valid next transitions to the client', function () {
    $organization = Organization::factory()->create([
        'onboarding_status' => OrganizationOnboardingStatus::Draft,
        'account_status' => OrganizationStatus::Terminated,
    ]);
    asOrganizationAdmin($this->superAdmin);

    $this->get(route('super-admin.organizations.show', $organization))
        ->assertInertia(fn (Assert $page) => $page
            ->where('onboardingOptions.0.value', 'submitted')
            ->where('onboardingOptions.1.value', 'cancelled')
            ->has('statusOptions', 0)
        );
});

it('enforces valid onboarding transitions and records the reason', function () {
    $organization = Organization::factory()->create();
    asOrganizationAdmin($this->superAdmin);
    $this->post(route('super-admin.organizations.onboarding-transition', $organization), ['target' => 'submitted', 'reason' => 'Identity package is complete.', 'lock_version' => 1])->assertRedirect();
    expect($organization->fresh()->onboarding_status)->toBe(OrganizationOnboardingStatus::Submitted)
        ->and(OrganizationEvent::where('reason', 'Identity package is complete.')->exists())->toBeTrue();
    $this->post(route('super-admin.organizations.onboarding-transition', $organization), ['target' => 'approved', 'reason' => 'Attempt invalid direct approval.', 'lock_version' => 2])->assertSessionHasErrors('target');
});

it('blocks activation until all readiness controls pass', function () {
    $organization = Organization::factory()->create(['onboarding_status' => OrganizationOnboardingStatus::Approved]);
    asOrganizationAdmin($this->superAdmin);
    $this->post(route('super-admin.organizations.status-transition', $organization), ['target' => 'active', 'reason' => 'Requesting platform activation.', 'lock_version' => 1])
        ->assertSessionHasErrors([
            'target' => 'Activation is blocked: Official identity must be verified; Administrative authority must be verified; Primary Organization Admin designation must be ready; Subscription readiness must be verified; Security configuration must be ready.',
        ]);
    $organization->update(['identity_verified' => true, 'authority_verified' => true, 'primary_admin_ready' => true, 'subscription_ready' => true, 'security_ready' => true]);
    $this->post(route('super-admin.organizations.status-transition', $organization), ['target' => 'active', 'reason' => 'Every readiness control is verified.', 'lock_version' => 1])->assertRedirect();
    expect($organization->fresh()->account_status)->toBe(OrganizationStatus::Active);
});

it('returns exact activation blockers to the organization detail page', function () {
    $organization = Organization::factory()->create([
        'identity_verified' => true,
        'authority_verified' => true,
    ]);
    asOrganizationAdmin($this->superAdmin);

    $this->get(route('super-admin.organizations.show', $organization))
        ->assertInertia(fn (Assert $page) => $page
            ->where('organization.activationReady', false)
            ->where('organization.activationBlockers', [
                'Onboarding must be approved',
                'Primary Organization Admin designation must be ready',
                'Subscription readiness must be verified',
                'Security configuration must be ready',
            ])
        );
});

it('renders explicit missing and critical readiness indicators', function () {
    $form = file_get_contents(resource_path('js/pages/super-admin/organizations/form.tsx'));
    $show = file_get_contents(resource_path('js/pages/super-admin/organizations/show.tsx'));

    expect($form)
        ->toContain('Critical issue unresolved')
        ->toContain('Complete')
        ->toContain('Missing')
        ->toContain('Unresolved')
        ->toContain('Resolve the recorded issue')
        ->and($show)
        ->toContain('Unresolved — activation blocked')
        ->toContain('Missing — currently');
});

it('keeps uploaded evidence private and quarantined', function () {
    Storage::fake('local');
    $organization = Organization::factory()->create();
    asOrganizationAdmin($this->superAdmin);
    $this->post(route('super-admin.organizations.documents.store', $organization), ['document_type' => 'authority_evidence', 'document' => UploadedFile::fake()->create('authority.pdf', 20, 'application/pdf')])->assertRedirect();
    $document = $organization->documents()->sole();
    Storage::disk('local')->assertExists($document->storage_path);
    expect($document->scan_status)->toBe('quarantined');
    $this->get("/storage/{$document->storage_path}")->assertForbidden();
});

it('has no ordinary delete route', function () {
    expect(fn () => route('super-admin.organizations.destroy', 1))->toThrow(InvalidArgumentException::class);
});
