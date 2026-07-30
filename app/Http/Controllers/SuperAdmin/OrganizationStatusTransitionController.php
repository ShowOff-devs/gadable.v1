<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Actions\SuperAdmin\Organizations\TransitionOrganizationStatus;
use App\Enums\OrganizationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\TransitionOrganizationRequest;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class OrganizationStatusTransitionController extends Controller
{
    public function __invoke(TransitionOrganizationRequest $request, Organization $organization, TransitionOrganizationStatus $action): RedirectResponse
    {
        Gate::authorize('update', $organization);
        $action->handle($organization, $request->user(), OrganizationStatus::from($request->validated('target')), $request->validated('reason'), (int) $request->validated('lock_version'));
        return back()->with('success', 'Organization status updated.');
    }
}
