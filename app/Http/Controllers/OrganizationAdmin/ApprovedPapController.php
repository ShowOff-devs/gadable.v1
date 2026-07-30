<?php

namespace App\Http\Controllers\OrganizationAdmin;

use App\Http\Controllers\Controller;
use App\Models\OrganizationBudgetBaseline;
use App\Models\Pap;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApprovedPapController extends Controller
{
    public function index(Request $request): Response
    {
        $organizationId = (int) $request->session()->get('organization_admin.organization_id');
        $query = Pap::query()->where('organization_id', $organizationId)
            ->whereHas('decision', fn (Builder $query) => $query->whereIn('status', ['approved', 'conditionally_approved']))
            ->with(['decision', 'financialSummary']);

        foreach (['fiscal_year', 'workflow_status', 'implementing_unit', 'gad_sector'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->string($filter)->toString());
            }
        }
        if ($request->filled('search')) {
            $search = '%'.$request->string('search')->toString().'%';
            $query->where(fn (Builder $query) => $query->where('reference', 'like', $search)->orWhere('title', 'like', $search));
        }

        $paps = $query->latest('id')->paginate(15)->withQueryString();

        return Inertia::render('organization-admin/approved-paps/index', [
            'paps' => $paps,
            'filters' => $request->only(['search', 'fiscal_year', 'workflow_status', 'implementing_unit', 'gad_sector']),
            'metrics' => [
                'visible_paps' => $paps->total(),
                'summaries_recorded' => Pap::query()->where('organization_id', $organizationId)->whereHas('financialSummary')->count(),
            ],
            'baselines' => OrganizationBudgetBaseline::query()->where('organization_id', $organizationId)->latest('fiscal_year')->get(),
        ]);
    }

    public function show(Request $request, int $pap): Response
    {
        $organizationId = (int) $request->session()->get('organization_admin.organization_id');
        $record = Pap::query()->where('organization_id', $organizationId)->whereKey($pap)
            ->whereHas('decision', fn (Builder $query) => $query->whereIn('status', ['approved', 'conditionally_approved']))
            ->with(['decision', 'financialSummary.amendments'])->firstOrFail();

        return Inertia::render('organization-admin/approved-paps/show', ['pap' => $record]);
    }
}
