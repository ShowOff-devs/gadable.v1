<?php

namespace App\Http\Middleware;

use App\Actions\OrganizationAdmin\ResolveAuthorizedOrganizations;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizationAdminSession
{
    public function __construct(private ResolveAuthorizedOrganizations $resolveAuthorizedOrganizations) {}

    /** @param Closure(Request): Response $next */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('organization-admin.login');
        }

        if (! $user->canAttemptOrganizationAdminPortal()
            || (config('organization-admin.mfa_required')
                && ! $request->session()->has('organization_admin.mfa_verified_at'))) {
            Auth::guard()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('organization-admin.login');
        }

        $organizations = $this->resolveAuthorizedOrganizations->handle($user);
        $selectedOrganizationId = (int) $request->session()->get('organization_admin.organization_id');

        if ($organizations->isEmpty()) {
            Auth::guard()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('organization-admin.login');
        }

        if (! in_array($selectedOrganizationId, $organizations->modelKeys(), true)) {
            $request->session()->forget('organization_admin.organization_id');

            if (! $request->routeIs('organization-admin.organizations.*')) {
                return redirect()->route('organization-admin.organizations.select');
            }
        }

        return $next($request);
    }
}
