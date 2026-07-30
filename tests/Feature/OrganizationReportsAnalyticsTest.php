<?php

use App\Models\Organization;
use App\Models\OrganizationBudgetBaseline;
use App\Models\Pap;
use App\Models\PapDecision;
use App\Models\PapFinancialSummary;
use App\Models\User;
use App\Reporting\OrganizationAnalytics;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function analyticsPap(Organization $organization, User $actor, string $reference, ?string $approvedAmount): Pap
{
    $pap = Pap::query()->create([
        'organization_id' => $organization->id, 'reference' => $reference, 'title' => 'Analytics PAP',
        'fiscal_year' => 2026, 'workflow_status' => 'approved', 'created_by' => $actor->id, 'updated_by' => $actor->id,
    ]);
    $decision = PapDecision::query()->create([
        'organization_id' => $organization->id, 'pap_id' => $pap->id, 'status' => 'approved',
        'decision_date' => '2026-07-28', 'approver_id' => $actor->id,
    ]);
    PapFinancialSummary::query()->create([
        'organization_id' => $organization->id, 'pap_id' => $pap->id, 'pap_decision_id' => $decision->id,
        'fiscal_year' => 2026, 'currency' => 'PHP', 'requested_amount' => '100.10',
        'approved_amount' => $approvedAmount, 'gad_classification' => 'direct_gad',
        'attribution_method' => 'direct_amount', 'gad_attributed_amount' => $approvedAmount,
        'approval_date' => '2026-07-28', 'financial_status' => 'approved',
        'created_by' => $actor->id, 'updated_by' => $actor->id,
    ]);

    return $pap;
}

it('scopes all analytics and filtered records to the selected organization', function () {
    $actor = User::factory()->create();
    $organizationA = Organization::factory()->create();
    $organizationB = Organization::factory()->create();
    analyticsPap($organizationA, $actor, 'A-001', '80.05');
    analyticsPap($organizationB, $actor, 'B-001', '999.99');

    $service = app(OrganizationAnalytics::class);
    $result = $service->summarize($organizationA->id, []);

    expect($result['cards']['total_paps'])->toBe(1)
        ->and($result['financial']['approved_amount'])->toBe('80.05')
        ->and($service->query($organizationA->id, ['search' => 'B-001'])->count())->toBe(0);
});

it('keeps missing money unavailable while preserving a confirmed zero', function () {
    $actor = User::factory()->create();
    $organization = Organization::factory()->create();
    analyticsPap($organization, $actor, 'NULL-001', null);

    $result = app(OrganizationAnalytics::class)->summarize($organization->id, []);
    expect($result['financial']['approved_amount'])->toBeNull();

    PapFinancialSummary::query()->where('organization_id', $organization->id)->update(['approved_amount' => '0.00']);
    $result = app(OrganizationAnalytics::class)->summarize($organization->id, []);
    expect($result['financial']['approved_amount'])->toBe('0.00');
});

it('calculates the five percent benchmark only from the annual organization baseline', function () {
    $actor = User::factory()->create();
    $organization = Organization::factory()->create();
    analyticsPap($organization, $actor, 'PAP-001', '80.00');
    OrganizationBudgetBaseline::query()->create([
        'organization_id' => $organization->id, 'fiscal_year' => 2026, 'currency' => 'PHP',
        'total_annual_budget' => '12345.67', 'approved_gad_budget' => '700.00',
        'created_by' => $actor->id, 'updated_by' => $actor->id,
    ]);

    $result = app(OrganizationAnalytics::class)->summarize($organization->id, ['fiscal_year' => 2026]);

    expect($result['baselines'][0]['benchmark'])->toBe('617.28')
        ->and($result['financial']['gad_attributed_amount'])->toBe('80.00');
});
