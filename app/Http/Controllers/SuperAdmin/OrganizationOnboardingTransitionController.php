<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Actions\SuperAdmin\Organizations\TransitionOrganizationOnboarding;
use App\Enums\OrganizationOnboardingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\TransitionOrganizationRequest;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class OrganizationOnboardingTransitionController extends Controller
{
    public function __invoke(TransitionOrganizationRequest $request, Organization $organization, TransitionOrganizationOnboarding $action): RedirectResponse
    {
        Gate::authorize('update', $organization);
        $action->handle($organization, $request->user(), OrganizationOnboardingStatus::from($request->validated('target')), $request->validated('reason'), (int) $request->validated('lock_version'));
        return back()->with('success', 'Onboarding status updated.');
    }
}
