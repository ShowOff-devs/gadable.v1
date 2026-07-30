<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Actions\Security\RecordSecurityEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\LoginRequest;
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
        private RecordSecurityEvent $recordSecurityEvent,
    ) {}

    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user instanceof User
            && $user->canAccessSuperAdminPortal()
            && $request->session()->has('super_admin.mfa_verified_at')) {
            return redirect('/super-admin/dashboard');
        }

        if ($user instanceof User && $user->canAccessSuperAdminPortal()) {
            $this->guard->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return Inertia::render('super-admin/auth/login');
        }

        if ($user !== null) {
            abort(403);
        }

        return Inertia::render('super-admin/auth/login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->validated();
        $user = User::query()->where('email', $credentials['email'])->first();
        $credentialsAreValid = $user !== null
            && Hash::check($credentials['password'], $user->password);
        $isEligible = $credentialsAreValid
            && $user->canAccessSuperAdminPortal()
            && $user->hasConfirmedTwoFactorAuthentication();

        if (! $isEligible) {
            $this->recordSecurityEvent->handle(
                $request,
                'super_admin.login_rejected',
                'failure',
                $credentialsAreValid ? $user : null,
                $credentials['email'],
            );

            throw ValidationException::withMessages([
                'email' => 'We could not verify the provided credentials.',
            ]);
        }

        if (config('hashing.rehash_on_login', true)) {
            $this->guard->getProvider()->rehashPasswordIfRequired($user, [
                'password' => $credentials['password'],
            ]);
        }

        $request->session()->put([
            'super_admin.login.id' => $user->getKey(),
            'super_admin.login.expires_at' => now()->addMinutes(5)->timestamp,
        ]);
        $request->session()->regenerate();

        $this->recordSecurityEvent->handle(
            $request,
            'super_admin.mfa_challenge_issued',
            'success',
            $user,
            $credentials['email'],
        );

        return redirect()->route('super-admin.two-factor.challenge');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user instanceof User) {
            $this->recordSecurityEvent->handle(
                $request,
                'super_admin.session_ended',
                'success',
                $user,
            );
        }

        $this->guard->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('super-admin.login');
    }
}
