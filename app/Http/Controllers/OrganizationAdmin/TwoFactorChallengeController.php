<?php

namespace App\Http\Controllers\OrganizationAdmin;

use App\Actions\OrganizationAdmin\ResolveAuthorizedOrganizations;
use App\Actions\Security\RecordSecurityEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\OrganizationAdmin\TwoFactorChallengeRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\StatefulGuard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use Laravel\Fortify\Fortify;

class TwoFactorChallengeController extends Controller
{
    public function __construct(
        private StatefulGuard $guard,
        private TwoFactorAuthenticationProvider $twoFactorProvider,
        private ResolveAuthorizedOrganizations $resolveAuthorizedOrganizations,
        private RecordSecurityEvent $recordSecurityEvent,
    ) {}

    public function create(Request $request): Response|RedirectResponse
    {
        return $this->challengedUser($request)
            ? Inertia::render('organization-admin/auth/two-factor-challenge')
            : redirect()->route('organization-admin.login');
    }

    public function store(TwoFactorChallengeRequest $request): RedirectResponse
    {
        $user = $this->challengedUser($request);

        if (! $user) {
            return redirect()->route('organization-admin.login');
        }

        $validated = $request->validated();
        $recoveryCode = $validated['recovery_code'] ?? null;
        $isValid = $recoveryCode
            ? collect($user->recoveryCodes())->contains(fn (string $code): bool => hash_equals($code, $recoveryCode))
            : $this->twoFactorProvider->verify(
                Fortify::currentEncrypter()->decrypt($user->two_factor_secret),
                $validated['code'],
            );

        if (! $isValid) {
            $this->recordSecurityEvent->handle($request, 'organization_admin.mfa_verification', 'failure', $user);

            return back()->withErrors([
                $recoveryCode ? 'recovery_code' : 'code' => 'We could not verify the provided authentication code.',
            ]);
        }

        if ($recoveryCode) {
            $user->replaceRecoveryCode($recoveryCode);
        }

        $organizations = $this->resolveAuthorizedOrganizations->handle($user);
        $request->session()->forget(['organization_admin.login.id', 'organization_admin.login.expires_at']);
        $this->guard->login($user);
        $request->session()->regenerate();
        $request->session()->put('organization_admin.mfa_verified_at', now()->timestamp);

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
                'recovery_code_used' => $recoveryCode !== null,
            ],
        );

        return $organizations->count() > 1
            ? redirect()->route('organization-admin.organizations.select')
            : redirect()->route('organization-admin.dashboard');
    }

    private function challengedUser(Request $request): ?User
    {
        $expiresAt = $request->session()->get('organization_admin.login.expires_at');

        if (! is_numeric($expiresAt) || now()->timestamp > (int) $expiresAt) {
            $request->session()->forget(['organization_admin.login.id', 'organization_admin.login.expires_at']);

            return null;
        }

        $user = User::query()->find($request->session()->get('organization_admin.login.id'));

        return $user instanceof User
            && $user->canAttemptOrganizationAdminPortal()
            && $user->hasConfirmedTwoFactorAuthentication()
            && $this->resolveAuthorizedOrganizations->handle($user)->isNotEmpty()
                ? $user
                : null;
    }
}
