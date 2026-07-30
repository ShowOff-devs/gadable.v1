<?php

namespace App\Http\Middleware;

use App\Data\OrganizationSubscriptionAccess;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizationSubscriptionWriteAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->isMethodSafe()) {
            $access = $request->attributes->get('subscription_access');

            if ($access instanceof OrganizationSubscriptionAccess && ! $access->canWrite) {
                $payload = [
                    'code' => 'subscription_read_only',
                    'message' => 'This subscription currently permits viewing existing records only.',
                    'subscription_status' => $access->lifecycleStatus?->value,
                    'permitted_actions' => ['view_subscription', 'request_renewal', 'logout'],
                    'request_reference' => (string) Str::uuid(),
                ];

                return $request->expectsJson()
                    ? response()->json($payload, 403)
                    : back()->withErrors(['subscription' => $payload['message']]);
            }
        }

        return $next($request);
    }
}
