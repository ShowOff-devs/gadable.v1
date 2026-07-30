<?php

namespace App\Http\Controllers\OrganizationAdmin;

use App\Actions\OrganizationAdmin\SavePapFinancialSummary;
use App\Actions\Security\RecordSecurityEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePapFinancialSummaryRequest;
use App\Models\Pap;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class PapFinancialSummaryController extends Controller
{
    public function store(StorePapFinancialSummaryRequest $request, int $pap, SavePapFinancialSummary $save, RecordSecurityEvent $audit): RedirectResponse
    {
        $organizationId = (int) $request->session()->get('organization_admin.organization_id');
        $record = Pap::query()->where('organization_id', $organizationId)->whereKey($pap)->firstOrFail();
        $user = $request->user();
        abort_unless($user instanceof User, 403);
        $summary = $save->handle($record, $user, $request->validated());
        $audit->handle($request, 'pap.financial_summary.created', 'success', $user, context: [
            'organization_id' => $organizationId, 'pap_id' => $record->id, 'financial_summary_id' => $summary->id,
        ]);

        return back()->with('success', 'Financial summary recorded.');
    }
}
