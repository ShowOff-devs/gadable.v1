<?php

namespace App\Http\Middleware;

use App\Actions\Subscriptions\ResolveOrganizationSubscriptionAccess;
use App\Models\Organization;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizationSubscriptionAccess
{
    public function __construct(
        private ResolveOrganizationSubscriptionAccess $resolveAccess,
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $organizationId = (int) $request->session()->get('organization_admin.organization_id');
        $organization = Organization::query()->find($organizationId);

        if (! $organization) {
            return redirect()->route('organization-admin.organizations.select');
        }

        $access = $this->resolveAccess->handle($organization);
        $request->attributes->set('organization', $organization);
        $request->attributes->set('subscription_access', $access);

        if (! $access->canAccess) {
            $reference = (string) Str::uuid();

            if ($request->expectsJson()) {
                return response()->json([
                    'code' => $access->reasonCode,
                    'message' => $access->reasonMessage,
                    'subscription_status' => $access->lifecycleStatus?->value,
                    'permitted_actions' => ['logout'],
                    'request_reference' => $reference,
                ], 403);
            }

            abort(403, "{$access->reasonMessage} Reference: {$reference}");
        }

        return $next($request);
    }
}
