<?php

namespace App\Reporting;

class MetricDefinitions
{
    /** @return array<int, array<string, mixed>> */
    public function all(): array
    {
        return [
            $this->definition('total_paps', 'Total PAPs', 'Unique organization-owned PAP records matching the filters.', ['paps'], 'count unique PAP IDs', 'count', 'Missing records are excluded.'),
            $this->definition('approved_paps', 'Approved PAPs', 'Unique PAPs with an authoritative Approved decision.', ['paps', 'pap_decisions'], 'count unique PAP IDs where decision status is approved', 'count', 'A missing decision is not treated as declined.'),
            $this->definition('conditionally_approved_paps', 'Conditionally Approved PAPs', 'Unique PAPs with an authoritative conditional approval.', ['paps', 'pap_decisions'], 'count unique PAP IDs where decision status is conditionally approved', 'count', 'A missing decision is excluded.'),
            $this->definition('financial_summaries_completed', 'Financial Summaries Completed', 'PAPs with a recorded financial summary.', ['pap_financial_summaries'], 'count unique financial-summary records', 'count', 'Missing summaries are reported separately.'),
            $this->definition('approved_amount', 'Total Approved Amount', 'Sum of recorded approved amounts in PHP.', ['pap_financial_summaries'], 'decimal-safe sum of non-null approved amounts', 'PHP', 'Missing is excluded; confirmed zero is included.'),
            $this->definition('gad_attributed_amount', 'Total GAD-Attributed Amount', 'Sum of recorded GAD-attributed amounts in PHP.', ['pap_financial_summaries'], 'decimal-safe sum of non-null attributed amounts', 'PHP', 'Missing is excluded; confirmed zero is included.'),
            $this->definition('organization_benchmark', 'Minimum GAD Budget Monitoring Benchmark', 'Five percent of the authorized annual organization budget baseline.', ['organization_budget_baselines'], 'total annual budget appropriation × 5%', 'PHP', 'Unavailable without a baseline; never applied to individual PAPs.'),
        ];
    }

    /**
     * @param  array<int, string>  $sources
     * @return array<string, mixed>
     */
    private function definition(string $key, string $name, string $description, array $sources, string $calculation, string $unit, string $nullHandling): array
    {
        return [
            'metric_key' => $key, 'display_name' => $name, 'description' => $description,
            'source_records' => $sources, 'calculation' => $calculation,
            'included_statuses' => ['matching authorized filters'], 'excluded_statuses' => ['outside organization scope'],
            'unit' => $unit, 'date_basis' => 'PAP fiscal year and authoritative decision date',
            'null_handling' => $nullHandling, 'privacy_rule' => 'Organization Admin tenant scope only',
            'version' => '1.0',
        ];
    }
}
