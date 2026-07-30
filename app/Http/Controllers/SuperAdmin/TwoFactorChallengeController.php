<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Actions\Security\RecordSecurityEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\TwoFactorChallengeRequest;
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
        private RecordSecurityEvent $recordSecurityEvent,
    ) {}

    public function create(Request $request): Response|RedirectResponse
    {
        if (! $this->challengedUser($request)) {
            return redirect()->route('super-admin.login');
        }

        return Inertia::render('super-admin/auth/two-factor-challenge');
    }

    public function store(TwoFactorChallengeRequest $request): RedirectResponse
    {
        $user = $this->challengedUser($request);

        if (! $user) {
            return redirect()->route('super-admin.login');
        }

        $validated = $request->validated();
        $recoveryCode = $validated['recovery_code'] ?? null;
        $isValid = $recoveryCode
            ? collect($user->recoveryCodes())->contains(
                fn (string $storedCode): bool => hash_equals($storedCode, $recoveryCode),
            )
            : $this->twoFactorProvider->verify(
                Fortify::currentEncrypter()->decrypt($user->two_factor_secret),
                $validated['code'],
            );

        if (! $isValid) {
            $this->recordSecurityEvent->handle(
                $request,
                'super_admin.mfa_verification',
                'failure',
                $user,
            );

            return back()->withErrors([
                $recoveryCode ? 'recovery_code' : 'code' => 'We could not verify the provided authentication code.',
            ]);
        }

        if ($recoveryCode) {
            $user->replaceRecoveryCode($recoveryCode);
        }

        $request->session()->forget([
            'super_admin.login.id',
            'super_admin.login.expires_at',
        ]);
        $this->guard->login($user);
        $request->session()->regenerate();
        $request->session()->put('super_admin.mfa_verified_at', now()->timestamp);

        $this->recordSecurityEvent->handle(
            $request,
            'super_admin.session_created',
            'success',
            $user,
            context: ['recovery_code_used' => $recoveryCode !== null],
        );

        return redirect('/super-admin/dashboard');
    }

    private function challengedUser(Request $request): ?User
    {
        $expiresAt = $request->session()->get('super_admin.login.expires_at');

        if (! is_numeric($expiresAt) || now()->timestamp > (int) $expiresAt) {
            $request->session()->forget([
                'super_admin.login.id',
                'super_admin.login.expires_at',
            ]);

            return null;
        }

        return User::query()
            ->whereKey($request->session()->get('super_admin.login.id'))
            ->where('account_type', User::ACCOUNT_TYPE_SUPER_ADMIN)
            ->where('account_status', User::STATUS_ACTIVE)
            ->first();
    }
}
