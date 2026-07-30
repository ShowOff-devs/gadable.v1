<?php

namespace App\Http\Controllers\OrganizationAdmin;

use App\Actions\OrganizationAdmin\ResolveAuthorizedOrganizations;
use App\Actions\Security\RecordSecurityEvent;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationContextController extends Controller
{
    public function __construct(
        private ResolveAuthorizedOrganizations $resolveAuthorizedOrganizations,
        private RecordSecurityEvent $recordSecurityEvent,
    ) {}

    public function create(Request $request): Response|RedirectResponse
    {
        $organizations = $this->resolveAuthorizedOrganizations->handle($request->user());

        if ($organizations->count() === 1) {
            $request->session()->put('organization_admin.organization_id', $organizations->firstOrFail()->getKey());

            return redirect()->route('organization-admin.dashboard');
        }

        return Inertia::render('organization-admin/select-organization', [
            'organizations' => $organizations->map->only(['id', 'official_name', 'acronym']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);
        $authorizedIds = $this->resolveAuthorizedOrganizations->handle($user)->modelKeys();
        $validated = $request->validate([
            'organization_id' => ['required', 'integer', Rule::in($authorizedIds)],
        ]);

        $request->session()->put('organization_admin.organization_id', $validated['organization_id']);
        $request->session()->regenerate();
        $this->recordSecurityEvent->handle(
            $request,
            'organization_admin.organization_selected',
            'success',
            $user,
            context: ['portal' => 'organization_admin', 'organization_id' => $validated['organization_id']],
        );

        return redirect()->route('organization-admin.dashboard');
    }
}
