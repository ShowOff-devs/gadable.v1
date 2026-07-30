<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationAdminDesignation;
use App\Models\SecurityEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserAccessController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);
        $accountTypes = User::query()->distinct()->orderBy('account_type')->pluck('account_type')->all();
        $accountStatuses = User::query()->distinct()->orderBy('account_status')->pluck('account_status')->all();
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'organization' => ['nullable', 'integer', 'exists:organizations,id'],
            'account_type' => ['nullable', Rule::in($accountTypes)],
            'status' => ['nullable', Rule::in($accountStatuses)],
            'verification' => ['nullable', Rule::in(['verified', 'pending'])],
            'mfa' => ['nullable', Rule::in(['enrolled', 'not_enrolled'])],
            'session' => ['nullable', Rule::in(['active', 'none'])],
            'sort' => ['nullable', Rule::in(['name', 'newest', 'last_activity'])],
        ]);
        $activeSince = now()->subMinutes((int) config('session.lifetime'))->timestamp;

        $users = User::query()
            ->with(['organizationMemberships.organization:id,official_name,code'])
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $nested) => $nested
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")))
            ->when($filters['organization'] ?? null, fn (Builder $query, int|string $organization) => $query->whereHas('organizationMemberships', fn (Builder $membership) => $membership->where('organization_id', $organization)))
            ->when($filters['account_type'] ?? null, fn (Builder $query, string $type) => $query->where('account_type', $type))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('account_status', $status))
            ->when(($filters['verification'] ?? null) === 'verified', fn (Builder $query) => $query->whereNotNull('email_verified_at'))
            ->when(($filters['verification'] ?? null) === 'pending', fn (Builder $query) => $query->whereNull('email_verified_at'))
            ->when(($filters['mfa'] ?? null) === 'enrolled', fn (Builder $query) => $query->whereNotNull('two_factor_confirmed_at'))
            ->when(($filters['mfa'] ?? null) === 'not_enrolled', fn (Builder $query) => $query->whereNull('two_factor_confirmed_at'))
            ->when(($filters['session'] ?? null) === 'active', fn (Builder $query) => $query->whereExists(fn ($session) => $session->selectRaw('1')->from('sessions')->whereColumn('sessions.user_id', 'users.id')->where('last_activity', '>=', $activeSince)))
            ->when(($filters['session'] ?? null) === 'none', fn (Builder $query) => $query->whereNotExists(fn ($session) => $session->selectRaw('1')->from('sessions')->whereColumn('sessions.user_id', 'users.id')->where('last_activity', '>=', $activeSince)))
            ->when(($filters['sort'] ?? 'name') === 'name', fn (Builder $query) => $query->orderBy('name'))
            ->when(($filters['sort'] ?? null) === 'newest', fn (Builder $query) => $query->latest())
            ->when(($filters['sort'] ?? null) === 'last_activity', fn (Builder $query) => $query->orderByDesc(
                DB::table('sessions')->selectRaw('max(last_activity)')->whereColumn('sessions.user_id', 'users.id'),
            ))
            ->paginate(20)
            ->withQueryString();

        $ids = $users->getCollection()->pluck('id');
        $sessionCounts = DB::table('sessions')->whereIn('user_id', $ids)->where('last_activity', '>=', $activeSince)->selectRaw('user_id, count(*) as aggregate')->groupBy('user_id')->pluck('aggregate', 'user_id');
        $lastLogins = SecurityEvent::query()->whereIn('user_id', $ids)->whereIn('event_type', ['super_admin.session_created', 'organization_admin.session_created'])->selectRaw('user_id, max(created_at) as last_login_at')->groupBy('user_id')->pluck('last_login_at', 'user_id');
        $pagination = $users->toArray();
        $pagination['data'] = $users->getCollection()->map(fn (User $user): array => $this->userSummary($user, (int) ($sessionCounts[$user->id] ?? 0), $lastLogins[$user->id] ?? null))->values()->all();

        return Inertia::render('super-admin/users/index', [
            'users' => $pagination,
            'filters' => $filters,
            'filterOptions' => [
                'organizations' => Organization::query()->orderBy('official_name')->get(['id', 'official_name']),
                'accountTypes' => $accountTypes,
                'accountStatuses' => $accountStatuses,
            ],
            'summary' => [
                'total' => User::query()->count(),
                'active' => User::query()->where('account_status', User::STATUS_ACTIVE)->count(),
                'pendingVerification' => User::query()->whereNull('email_verified_at')->count(),
                'suspendedOrLocked' => User::query()->whereIn('account_status', ['suspended', 'locked'])->count(),
                'privilegedWithoutMfa' => User::query()->whereIn('account_type', [User::ACCOUNT_TYPE_SUPER_ADMIN, User::ACCOUNT_TYPE_ORGANIZATION_ADMIN])->whereNull('two_factor_confirmed_at')->count(),
                'expiringDesignations' => OrganizationAdminDesignation::query()->where('status', OrganizationAdminDesignation::STATUS_ACTIVE)->whereBetween('expires_at', [now(), now()->addDays(30)])->count(),
                'activeSessions' => DB::table('sessions')->where('last_activity', '>=', $activeSince)->count(),
                'accessCases' => null,
            ],
            'updatedAt' => now()->toIso8601String(),
        ]);
    }

    public function show(Request $request, User $user): Response
    {
        Gate::authorize('view', $user);
        $activeSince = now()->subMinutes((int) config('session.lifetime'))->timestamp;
        $user->load([
            'organizationMemberships.organization:id,official_name,code,account_status',
            'organizationMemberships.adminDesignations' => fn ($query) => $query->latest('effective_at'),
            'securityEvents' => fn ($query) => $query->latest()->limit(30),
        ]);
        $sessions = DB::table('sessions')->where('user_id', $user->id)->where('last_activity', '>=', $activeSince)->orderByDesc('last_activity')->get(['id', 'last_activity']);

        return Inertia::render('super-admin/users/show', [
            'user' => [
                ...$this->userSummary(
                    $user,
                    $sessions->count(),
                    $user->securityEvents
                        ->first(fn (SecurityEvent $event): bool => in_array($event->event_type, ['super_admin.session_created', 'organization_admin.session_created'], true))
                        ?->created_at?->toIso8601String(),
                ),
                'createdAt' => $user->created_at?->toIso8601String(),
                'memberships' => $user->organizationMemberships->map(fn ($membership): array => [
                    'id' => $membership->id,
                    'organization' => ['id' => $membership->organization->id, 'name' => $membership->organization->official_name, 'code' => $membership->organization->code, 'status' => $membership->organization->account_status->value],
                    'status' => $membership->status,
                    'startedAt' => $membership->started_at?->toIso8601String(),
                    'endedAt' => $membership->ended_at?->toIso8601String(),
                    'designations' => $membership->adminDesignations->map(fn (OrganizationAdminDesignation $designation): array => [
                        'id' => $designation->id,
                        'type' => 'organization_admin',
                        'status' => $designation->isCurrentlyValid() ? 'active' : ($designation->expires_at?->isPast() ? 'expired' : $designation->status),
                        'effectiveAt' => $designation->effective_at->toIso8601String(),
                        'expiresAt' => $designation->expires_at?->toIso8601String(),
                        'authorityDocumented' => $designation->authority_documented_at !== null,
                    ])->values()->all(),
                ])->values()->all(),
                'sessions' => $sessions->map(fn ($session): array => [
                    'current' => hash_equals((string) $session->id, $request->session()->getId()),
                    'lastActivityAt' => now()->setTimestamp($session->last_activity)->toIso8601String(),
                    'deviceSummary' => 'Browser session',
                ])->values()->all(),
                'activity' => $user->securityEvents->map(fn (SecurityEvent $event): array => [
                    'id' => $event->id,
                    'type' => $event->event_type,
                    'outcome' => $event->outcome,
                    'occurredAt' => $event->created_at?->toIso8601String(),
                ])->values()->all(),
            ],
            'availability' => [
                'roleAssignments' => false,
                'qualifications' => false,
                'assignments' => false,
                'securityActions' => false,
                'duplicateCases' => false,
                'transferCases' => false,
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private function userSummary(User $user, int $activeSessions, mixed $lastLoginAt): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'reference' => 'USR-'.str_pad((string) $user->id, 6, '0', STR_PAD_LEFT),
            'accountType' => $user->account_type,
            'accountStatus' => $user->account_status,
            'verificationStatus' => $user->email_verified_at ? 'verified' : 'pending',
            'mfaStatus' => $user->hasConfirmedTwoFactorAuthentication() ? 'enrolled' : 'not_enrolled',
            'organizations' => $user->organizationMemberships->map(fn ($membership): array => [
                'id' => $membership->organization->id,
                'name' => $membership->organization->official_name,
                'membershipStatus' => $membership->status,
            ])->values(),
            'activeSessions' => $activeSessions,
            'lastLoginAt' => $lastLoginAt,
        ];
    }
}
