<?php

namespace App\Http\Controllers\OrganizationAdmin;

use App\Actions\Security\RecordSecurityEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrganizationBudgetBaselineRequest;
use App\Models\OrganizationBudgetBaseline;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class OrganizationBudgetBaselineController extends Controller
{
    public function store(StoreOrganizationBudgetBaselineRequest $request, RecordSecurityEvent $audit): RedirectResponse
    {
        $organizationId = (int) $request->session()->get('organization_admin.organization_id');
        $user = $request->user();
        abort_unless($user instanceof User, 403);
        $baseline = OrganizationBudgetBaseline::query()->updateOrCreate(
            ['organization_id' => $organizationId, 'fiscal_year' => $request->integer('fiscal_year')],
            [...$request->validated(), 'created_by' => $user->id, 'updated_by' => $user->id],
        );
        $audit->handle($request, 'organization.budget_baseline.saved', 'success', $user, context: [
            'organization_id' => $organizationId, 'budget_baseline_id' => $baseline->id,
        ]);

        return back()->with('success', 'Annual budget baseline saved.');
    }
}
