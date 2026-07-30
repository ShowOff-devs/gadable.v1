<?php

namespace App\Http\Controllers\OrganizationAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrganizationAdmin\ReportsAnalyticsRequest;
use App\Reporting\MetricDefinitions;
use App\Reporting\OrganizationAnalytics;
use Inertia\Inertia;
use Inertia\Response;

class ReportsAnalyticsController extends Controller
{
    public function __invoke(
        ReportsAnalyticsRequest $request,
        OrganizationAnalytics $analytics,
        MetricDefinitions $definitions,
    ): Response {
        $organizationId = (int) $request->session()->get('organization_admin.organization_id');
        $filters = $request->filters();
        $sort = $request->validated('sort', 'reference');
        $direction = $request->validated('direction', 'asc');
        $query = $analytics->query($organizationId, $filters);

        if ($sort === 'decision_date') {
            $query->orderBy(
                \App\Models\PapDecision::query()->select('decision_date')->whereColumn('pap_decisions.pap_id', 'paps.id')->limit(1),
                $direction,
            );
        } elseif ($sort === 'approved_amount') {
            $query->orderBy(
                \App\Models\PapFinancialSummary::query()->select('approved_amount')->whereColumn('pap_financial_summaries.pap_id', 'paps.id')->limit(1),
                $direction,
            );
        } else {
            $query->orderBy($sort, $direction);
        }

        return Inertia::render('organization-admin/reports-analytics/index', [
            'section' => $request->validated('section', 'overview'),
            'filters' => $filters,
            'sort' => ['column' => $sort, 'direction' => $direction],
            'analytics' => $analytics->summarize($organizationId, $filters),
            'records' => $query->paginate((int) $request->validated('per_page', 25))->withQueryString(),
            'metricDefinitions' => $definitions->all(),
            'reportScope' => ['organization_id' => $organizationId, 'currency' => 'PHP'],
        ]);
    }
}
