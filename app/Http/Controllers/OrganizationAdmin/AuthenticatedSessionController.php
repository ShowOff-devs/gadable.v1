<?php

namespace App\Http\Controllers\OrganizationAdmin;

use App\Actions\OrganizationAdmin\ResolveAuthorizedOrganizations;
use App\Actions\Security\RecordSecurityEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\OrganizationAdmin\LoginRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\StatefulGuard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function __construct(
        private StatefulGuard $guard,
        private ResolveAuthorizedOrganizations $resolveAuthorizedOrganizations,
        private RecordSecurityEvent $recordSecurityEvent,
    ) {}

    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user() === null) {
            return Inertia::render('organization-admin/auth/login', [
                'canResetPassword' => true,
                'status' => $request->session()->get('status'),
            ]);
        }

        if ($request->user()->canAttemptOrganizationAdminPortal()
            && (! config('organization-admin.mfa_required')
                || $request->session()->has('organization_admin.mfa_verified_at'))) {
            return redirect()->route('organization-admin.dashboard');
        }

        abort(403);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->validated();
        $user = User::query()->where('email', $credentials['email'])->first();
        $credentialsAreValid = $user !== null && Hash::check($credentials['password'], $user->password);
        $isEligible = $credentialsAreValid
            && $user->canAttemptOrganizationAdminPortal()
            && (! config('organization-admin.mfa_required')
                || $user->hasConfirmedTwoFactorAuthentication())
            && $this->resolveAuthorizedOrganizations->handle($user)->isNotEmpty();

        if (! $isEligible) {
            $this->recordSecurityEvent->handle(
                $request,
                'organization_admin.login_rejected',
                'failure',
                $credentialsAreValid ? $user : null,
                $credentials['email'],
                ['portal' => 'organization_admin'],
            );

            throw ValidationException::withMessages([
                'email' => 'We could not sign you in with those credentials. Check your details or contact your authorized administrator.',
            ]);
        }

        if (config('hashing.rehash_on_login', true)) {
            $this->guard->getProvider()->rehashPasswordIfRequired($user, ['password' => $credentials['password']]);
        }

        if (! config('organization-admin.mfa_required')) {
            $organizations = $this->resolveAuthorizedOrganizations->handle($user);
            $this->guard->login($user);
            $request->session()->regenerate();

            if ($organizations->count() === 1) {
                $request->session()->put('organization_admin.organization_id', $organizations->firstOrFail()->getKey());
            }

            $this->recordSecurityEvent->handle(
                $request,
                'organization_admin.session_created',
                'success',
                $user,
                context: [
                    'portal' => 'organization_admin',
                    'organization_id' => $organizations->count() === 1 ? $organizations->firstOrFail()->getKey() : null,
                    'mfa_required' => false,
                ],
            );

            return $organizations->count() > 1
                ? redirect()->route('organization-admin.organizations.select')
                : redirect()->route('organization-admin.dashboard');
        }

        $request->session()->put([
            'organization_admin.login.id' => $user->getKey(),
            'organization_admin.login.expires_at' => now()->addMinutes(5)->timestamp,
        ]);
        $request->session()->regenerate();

        $this->recordSecurityEvent->handle(
            $request,
            'organization_admin.mfa_challenge_issued',
            'success',
            $user,
            context: ['portal' => 'organization_admin'],
        );

        return redirect()->route('organization-admin.two-factor.challenge');
    }

    public function destroy(Request $request): RedirectResponse
    {
        if ($request->user() instanceof User) {
            $this->recordSecurityEvent->handle(
                $request,
                'organization_admin.session_ended',
                'success',
                $request->user(),
                context: [
                    'portal' => 'organization_admin',
                    'organization_id' => $request->session()->get('organization_admin.organization_id'),
                ],
            );
        }

        $this->guard->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('organization-admin.login');
    }
}
