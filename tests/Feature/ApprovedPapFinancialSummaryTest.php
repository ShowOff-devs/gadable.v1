<?php

use App\Actions\OrganizationAdmin\AmendPapFinancialSummary;
use App\Actions\OrganizationAdmin\SavePapFinancialSummary;
use App\Models\Organization;
use App\Models\Pap;
use App\Models\PapDecision;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

function approvedPapFixture(string $decisionStatus = 'approved'): array
{
    $organization = Organization::factory()->create();
    $user = User::factory()->create();
    $pap = Pap::query()->create([
        'organization_id' => $organization->id,
        'reference' => 'PAP-2026-001',
        'title' => 'Authorized test PAP',
        'fiscal_year' => 2026,
        'workflow_status' => $decisionStatus,
        'created_by' => $user->id,
        'updated_by' => $user->id,
    ]);
    PapDecision::query()->create([
        'organization_id' => $organization->id,
        'pap_id' => $pap->id,
        'status' => $decisionStatus,
        'decision_date' => '2026-07-28',
        'approver_id' => $user->id,
    ]);

    return [$organization, $user, $pap->fresh('decision')];
}

it('records a decimal-safe percentage attribution only for an approved decision', function () {
    [, $user, $pap] = approvedPapFixture();
    $summary = app(SavePapFinancialSummary::class)->handle($pap, $user, [
        'fiscal_year' => 2026,
        'currency' => 'PHP',
        'approved_amount' => '1000.00',
        'gad_classification' => 'attributable_regular_program',
        'attribution_method' => 'percentage_based',
        'attribution_percentage' => '12.5000',
        'attribution_base_amount' => '999.99',
        'approval_date' => '2026-07-28',
        'financial_status' => 'approved',
    ]);

    expect($summary->gad_attributed_amount)->toBe('125.00')
        ->and($summary->organization_id)->toBe($pap->organization_id);
});

it('rejects a financial summary without an eligible final decision', function () {
    [, $user, $pap] = approvedPapFixture('declined');

    app(SavePapFinancialSummary::class)->handle($pap, $user, [
        'fiscal_year' => 2026, 'currency' => 'PHP', 'gad_classification' => 'not_yet_classified',
        'attribution_method' => 'not_yet_available', 'approval_date' => '2026-07-28', 'financial_status' => 'declined',
    ]);
})->throws(ValidationException::class);

it('preserves the prior value in an append-only amendment and increments the lock', function () {
    [, $user, $pap] = approvedPapFixture();
    $summary = app(SavePapFinancialSummary::class)->handle($pap, $user, [
        'fiscal_year' => 2026, 'currency' => 'PHP', 'approved_amount' => '1000.00',
        'gad_classification' => 'direct_gad', 'attribution_method' => 'direct_amount',
        'gad_attributed_amount' => '1000.00', 'approval_date' => '2026-07-28', 'financial_status' => 'approved',
    ]);

    $amendment = app(AmendPapFinancialSummary::class)->handle($summary, $user, [
        'lock_version' => 1, 'changes' => ['approved_amount' => '900.00'],
        'reason' => 'Authorized correction to the approved amount.',
        'authority_reference' => 'AUTH-2026-09', 'effective_date' => '2026-07-29', 'attested' => true,
    ]);

    expect($amendment->previous_values['approved_amount'])->toBe('1000.00')
        ->and($summary->fresh()->approved_amount)->toBe('900.00')
        ->and($summary->fresh()->lock_version)->toBe(2);
});
