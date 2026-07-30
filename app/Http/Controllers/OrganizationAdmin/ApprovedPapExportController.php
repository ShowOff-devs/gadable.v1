<?php

namespace App\Http\Controllers\OrganizationAdmin;

use App\Http\Controllers\Controller;
use App\Models\Pap;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ApprovedPapExportController extends Controller
{
    public function __invoke(Request $request): StreamedResponse
    {
        $organizationId = (int) $request->session()->get('organization_admin.organization_id');
        $paps = Pap::query()->where('organization_id', $organizationId)
            ->whereHas('decision', fn ($query) => $query->whereIn('status', ['approved', 'conditionally_approved']))
            ->with(['decision', 'financialSummary'])->orderBy('reference')->cursor();

        return response()->streamDownload(function () use ($paps): void {
            $output = fopen('php://output', 'w');
            if ($output === false) {
                return;
            }
            fputcsv($output, ['Reference', 'Title', 'Fiscal year', 'Decision', 'Decision date', 'Requested amount', 'Approved amount', 'GAD attributed amount', 'Financial status']);
            foreach ($paps as $pap) {
                fputcsv($output, [$pap->reference, $pap->title, $pap->fiscal_year, $pap->decision?->status,
                    $pap->decision?->decision_date?->toDateString(), $pap->financialSummary?->requested_amount,
                    $pap->financialSummary?->approved_amount, $pap->financialSummary?->gad_attributed_amount,
                    $pap->financialSummary?->financial_status]);
            }
            fclose($output);
        }, 'approved-paps-financial-summary.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
