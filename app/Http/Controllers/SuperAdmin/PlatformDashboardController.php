<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Actions\SuperAdmin\BuildPlatformDashboard;
use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\PlatformDashboardRequest;
use Inertia\Inertia;
use Inertia\Response;

class PlatformDashboardController extends Controller
{
    public function __invoke(
        PlatformDashboardRequest $request,
        BuildPlatformDashboard $buildPlatformDashboard,
    ): Response
    {
        return Inertia::render('super-admin/dashboard', [
            'dashboard' => $buildPlatformDashboard->handle($request->period()),
        ]);
    }
}
