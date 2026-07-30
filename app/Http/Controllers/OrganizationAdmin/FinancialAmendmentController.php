<?php

namespace App\Http\Controllers\OrganizationAdmin;

use App\Actions\OrganizationAdmin\AmendPapFinancialSummary;
use App\Actions\Security\RecordSecurityEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFinancialAmendmentRequest;
use App\Models\PapFinancialSummary;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class FinancialAmendmentController extends Controller
{
    public function store(StoreFinancialAmendmentRequest $request, int $pap, AmendPapFinancialSummary $amend, RecordSecurityEvent $audit): RedirectResponse
    {
        $organizationId = (int) $request->session()->get('organization_admin.organization_id');
        $summary = PapFinancialSummary::query()->where('organization_id', $organizationId)->where('pap_id', $pap)->firstOrFail();
        $user = $request->user();
        abort_unless($user instanceof User, 403);
        $amendment = $amend->handle($summary, $user, $request->validated());
        $audit->handle($request, 'pap.financial_summary.amended', 'success', $user, context: [
            'organization_id' => $organizationId, 'pap_id' => $pap, 'financial_summary_id' => $summary->id, 'amendment_id' => $amendment->id,
        ]);

        return back()->with('success', 'Financial amendment recorded.');
    }
}
