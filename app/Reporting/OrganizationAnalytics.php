<?php

namespace App\Reporting;

use App\Models\OrganizationBudgetBaseline;
use App\Models\Pap;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class OrganizationAnalytics
{
    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Pap>
     */
    public function query(int $organizationId, array $filters): Builder
    {
        $query = Pap::query()->where('organization_id', $organizationId)->with(['decision', 'financialSummary']);

        foreach (['fiscal_year', 'workflow_status', 'funding_source'] as $filter) {
            if (isset($filters[$filter])) {
                $query->where($filter, $filters[$filter]);
            }
        }
        if (isset($filters['search'])) {
            $search = '%'.$filters['search'].'%';
            $query->where(fn (Builder $query) => $query->where('reference', 'like', $search)->orWhere('title', 'like', $search));
        }
        if (isset($filters['decision_status'])) {
            $query->whereHas('decision', fn (Builder $query) => $query->where('status', $filters['decision_status']));
        }
        if (isset($filters['decision_from'])) {
            $query->whereHas('decision', fn (Builder $query) => $query->whereDate('decision_date', '>=', $filters['decision_from']));
        }
        if (isset($filters['decision_to'])) {
            $query->whereHas('decision', fn (Builder $query) => $query->whereDate('decision_date', '<=', $filters['decision_to']));
        }
        if (isset($filters['financial_status'])) {
            $query->whereHas('financialSummary', fn (Builder $query) => $query->where('financial_status', $filters['financial_status']));
        }
        if (isset($filters['gad_classification'])) {
            $query->whereHas('financialSummary', fn (Builder $query) => $query->where('gad_classification', $filters['gad_classification']));
        }

        return $query;
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function summarize(int $organizationId, array $filters): array
    {
        $records = $this->query($organizationId, $filters)->get();
        $summaries = $records->pluck('financialSummary')->filter();
        $decisions = $records->pluck('decision')->filter();
        $baselineQuery = OrganizationBudgetBaseline::query()->where('organization_id', $organizationId);
        if (isset($filters['fiscal_year'])) {
            $baselineQuery->where('fiscal_year', $filters['fiscal_year']);
        }
        $baselines = $baselineQuery->orderBy('fiscal_year')->get();

        return [
            'cards' => [
                'total_paps' => $records->count(),
                'approved_paps' => $decisions->where('status', 'approved')->count(),
                'conditionally_approved_paps' => $decisions->where('status', 'conditionally_approved')->count(),
                'declined_paps' => $decisions->where('status', 'declined')->count(),
                'financial_summaries_completed' => $summaries->count(),
                'records_requiring_attention' => $this->qualityFindings($records)->sum('count'),
            ],
            'financial' => [
                'total_pap_cost' => $this->sumMoney($summaries, 'total_pap_cost'),
                'requested_amount' => $this->sumMoney($summaries, 'requested_amount'),
                'recommended_amount' => $this->sumMoney($summaries, 'recommended_amount'),
                'approved_amount' => $this->sumMoney($summaries, 'approved_amount'),
                'gad_attributed_amount' => $this->sumMoney($summaries, 'gad_attributed_amount'),
                'variance' => $this->difference($this->sumMoney($summaries, 'requested_amount'), $this->sumMoney($summaries, 'approved_amount')),
                'direct_gad_count' => $summaries->where('gad_classification', 'direct_gad')->count(),
                'attributable_count' => $summaries->where('gad_classification', 'attributable_regular_program')->count(),
            ],
            'decision_distribution' => $decisions->groupBy('status')->map->count(),
            'financial_status_distribution' => $summaries->groupBy('financial_status')->map->count(),
            'quality_findings' => $this->qualityFindings($records)->values(),
            'baselines' => $baselines->map(fn (OrganizationBudgetBaseline $baseline) => [
                'fiscal_year' => $baseline->fiscal_year,
                'total_annual_budget' => $baseline->total_annual_budget,
                'approved_gad_budget' => $baseline->approved_gad_budget,
                'benchmark' => $baseline->total_annual_budget === null ? null : $this->percentage((string) $baseline->total_annual_budget, 5),
                'allocation_rate' => $this->allocationRate(
                    $baseline->approved_gad_budget === null ? null : (string) $baseline->approved_gad_budget,
                    $baseline->total_annual_budget === null ? null : (string) $baseline->total_annual_budget,
                ),
            ]),
            'unavailable_sections' => [
                ['name' => 'PAP Participation', 'reason' => 'Submission events, proponents, and organization units are not implemented.'],
                ['name' => 'Workflow Performance', 'reason' => 'Immutable PAP workflow events and stage deadlines are not implemented.'],
                ['name' => 'Evaluator Workload', 'reason' => 'Evaluator qualifications and assignment records are not implemented.'],
                ['name' => 'Assessments & Scores', 'reason' => 'Frozen assessment tools, responses, and authoritative scores are not implemented.'],
                ['name' => 'Revisions & Deficiencies', 'reason' => 'Revision cycles and controlled deficiency categories are not implemented.'],
            ],
        ];
    }

    /**
     * @param  Collection<int, mixed>  $records
     * @return Collection<int, array{issue_type: string, severity: string, count: int<1, max>, description: string, action: string}>
     */
    private function qualityFindings(Collection $records): Collection
    {
        return collect([
            ['issue_type' => 'approved_without_financial_summary', 'severity' => 'high', 'count' => $records->filter(fn ($pap) => in_array($pap->decision?->status, ['approved', 'conditionally_approved'], true) && $pap->financialSummary === null)->count(), 'description' => 'Approved PAPs without a financial summary.', 'action' => 'Review the approved PAP and record its authorized financial summary.'],
            ['issue_type' => 'missing_approved_amount', 'severity' => 'medium', 'count' => $records->filter(fn ($pap) => $pap->financialSummary !== null && $pap->financialSummary->approved_amount === null)->count(), 'description' => 'Financial summaries without an approved amount.', 'action' => 'Verify official evidence; preserve the value as missing until confirmed.'],
            ['issue_type' => 'missing_official_reference', 'severity' => 'medium', 'count' => $records->filter(fn ($pap) => $pap->financialSummary !== null && blank($pap->financialSummary->official_reference))->count(), 'description' => 'Financial summaries without an official reference.', 'action' => 'Review supporting authority and record a reference through an authorized amendment.'],
            ['issue_type' => 'incomplete_percentage_attribution', 'severity' => 'high', 'count' => $records->filter(fn ($pap) => $pap->financialSummary?->attribution_method === 'percentage_based' && ($pap->financialSummary->attribution_base_amount === null || $pap->financialSummary->attribution_percentage === null))->count(), 'description' => 'Percentage attribution is missing a base or approved percentage.', 'action' => 'Review the approved attribution basis; do not infer a percentage.'],
        ])->filter(fn (array $finding) => $finding['count'] > 0);
    }

    /** @param Collection<int, mixed> $records */
    private function sumMoney(Collection $records, string $attribute): ?string
    {
        $values = $records->pluck($attribute)->filter(fn (mixed $value) => $value !== null);
        if ($values->isEmpty()) {
            return null;
        }

        $cents = $values->sum(fn (mixed $value): int => $this->toCents((string) $value));

        return $this->fromCents($cents);
    }

    private function difference(?string $left, ?string $right): ?string
    {
        return $left === null || $right === null ? null : $this->fromCents($this->toCents($left) - $this->toCents($right));
    }

    private function percentage(string $amount, int $percent): string
    {
        return $this->fromCents(intdiv(($this->toCents($amount) * $percent) + 50, 100));
    }

    private function allocationRate(?string $approved, ?string $total): ?string
    {
        if ($approved === null || $total === null || $this->toCents($total) === 0) {
            return null;
        }

        return number_format($this->toCents($approved) * 100 / $this->toCents($total), 2, '.', '');
    }

    private function toCents(string $value): int
    {
        $negative = str_starts_with($value, '-');
        [$whole, $fraction] = array_pad(explode('.', ltrim($value, '-'), 2), 2, '');
        $result = ((int) $whole * 100) + (int) str_pad(substr($fraction, 0, 2), 2, '0');

        return $negative ? -$result : $result;
    }

    private function fromCents(int $cents): string
    {
        $sign = $cents < 0 ? '-' : '';
        $absolute = abs($cents);

        return sprintf('%s%d.%02d', $sign, intdiv($absolute, 100), $absolute % 100);
    }
}
