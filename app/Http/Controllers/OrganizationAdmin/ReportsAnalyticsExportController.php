<?php

namespace App\Http\Controllers\OrganizationAdmin;

use App\Actions\Security\RecordSecurityEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\OrganizationAdmin\ReportsAnalyticsRequest;
use App\Models\User;
use App\Reporting\OrganizationAnalytics;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportsAnalyticsExportController extends Controller
{
    public function __invoke(ReportsAnalyticsRequest $request, OrganizationAnalytics $analytics, RecordSecurityEvent $audit): StreamedResponse
    {
        $organizationId = (int) $request->session()->get('organization_admin.organization_id');
        $filters = $request->filters();
        $user = $request->user();
        abort_unless($user instanceof User, 403);
        $reference = (string) Str::uuid();
        $audit->handle($request, 'organization.report.exported', 'success', $user, context: [
            'organization_id' => $organizationId,
            'report_type' => $request->validated('section', 'overview'),
            'export_format' => 'csv',
            'filter_keys' => implode(',', array_keys($filters)),
            'export_reference' => $reference,
        ]);
        $recordIds = $analytics->query($organizationId, $filters)->orderBy('reference')->pluck('id');

        return response()->streamDownload(function () use ($recordIds): void {
            $output = fopen('php://output', 'w');
            if ($output === false) {
                return;
            }
            fputcsv($output, ['PAP Reference', 'PAP Title', 'Fiscal Year', 'Decision', 'Decision Date', 'Requested Amount', 'Recommended Amount', 'Approved Amount', 'GAD-Attributed Amount', 'Financial Status']);
            \App\Models\Pap::query()->whereKey($recordIds)->with(['decision', 'financialSummary'])->orderBy('reference')
                ->each(function (\App\Models\Pap $pap) use ($output): void {
                    fputcsv($output, [
                        $pap->reference, $pap->title, $pap->fiscal_year, $pap->decision?->status,
                        $pap->decision?->decision_date?->toDateString(), $pap->financialSummary?->requested_amount,
                        $pap->financialSummary?->recommended_amount, $pap->financialSummary?->approved_amount,
                        $pap->financialSummary?->gad_attributed_amount, $pap->financialSummary?->financial_status,
                    ]);
                });
            fclose($output);
        }, 'organization-reports-analytics.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'X-Report-Reference' => $reference,
        ]);
    }
}
