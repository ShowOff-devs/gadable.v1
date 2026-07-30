<?php

namespace App\Http\Controllers\OrganizationAdmin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $organization = Organization::query()->findOrFail(
            $request->session()->get('organization_admin.organization_id'),
        );

        return Inertia::render('organization-admin/dashboard', [
            'organization' => $organization->only(['id', 'official_name', 'acronym', 'code']),
            'dashboard' => null,
            'previewMode' => app()->isLocal(),
        ]);
    }
}
