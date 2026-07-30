<?php

namespace App\Actions\SuperAdmin;

use App\Models\SecurityEvent;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class BuildPlatformDashboard
{
    /**
     * @return array<string, mixed>
     */
    public function handle(string $period): array
    {
        $since = match ($period) {
            '24h' => now()->subDay(),
            '30d' => now()->subDays(30),
            default => now()->subDays(7),
        };

        $activeUsers = User::query()
            ->where('account_status', User::STATUS_ACTIVE)
            ->count();
        $superAdmins = User::query()
            ->where('account_type', User::ACCOUNT_TYPE_SUPER_ADMIN)
            ->where('account_status', User::STATUS_ACTIVE)
            ->count();
        $failedJobs = DB::table('failed_jobs')->count();
        $queuedJobs = DB::table('jobs')->count();
        $rejectedAdministrativeLogins = SecurityEvent::query()
            ->where('event_type', 'super_admin.login_rejected')
            ->where('created_at', '>=', $since)
            ->count();
        $failedMfaAttempts = SecurityEvent::query()
            ->where('event_type', 'super_admin.mfa_verification')
            ->where('outcome', 'failure')
            ->where('created_at', '>=', $since)
            ->count();
        $organizations = Organization::query()->count();

        $attention = collect([
            $failedJobs > 0 ? [
                'id' => 'failed-jobs',
                'severity' => 'high',
                'title' => 'Failed background jobs require review',
                'description' => "{$failedJobs} failed ".str('job')->plural($failedJobs).' are recorded in the platform queue.',
                'module' => 'Platform Operations',
                'occurredAt' => now()->toIso8601String(),
            ] : null,
            $failedMfaAttempts > 0 ? [
                'id' => 'failed-mfa',
                'severity' => 'critical',
                'title' => 'Failed administrative MFA attempts detected',
                'description' => "{$failedMfaAttempts} failed MFA ".str('attempt')->plural($failedMfaAttempts)." occurred in the selected period.",
                'module' => 'Security & Audit',
                'occurredAt' => now()->toIso8601String(),
            ] : null,
            $rejectedAdministrativeLogins > 0 ? [
                'id' => 'rejected-logins',
                'severity' => 'medium',
                'title' => 'Administrative sign-in attempts rejected',
                'description' => "{$rejectedAdministrativeLogins} administrative sign-in ".str('attempt')->plural($rejectedAdministrativeLogins)." were rejected in the selected period.",
                'module' => 'Security & Audit',
                'occurredAt' => now()->toIso8601String(),
            ] : null,
        ])->filter()->sortBy(fn (array $item): int => match ($item['severity']) {
            'critical' => 1,
            'high' => 2,
            'medium' => 3,
            default => 4,
        })->values()->all();

        $recentActivity = SecurityEvent::query()
            ->whereIn('event_type', [
                'super_admin.session_created',
                'super_admin.login_rejected',
                'super_admin.mfa_verification',
            ])
            ->latest()
            ->limit(6)
            ->get(['id', 'event_type', 'outcome', 'created_at'])
            ->map(fn (SecurityEvent $event): array => [
                'id' => (string) $event->id,
                'description' => match ($event->event_type) {
                    'super_admin.session_created' => 'Administrative session established',
                    'super_admin.mfa_verification' => 'Administrative MFA verification processed',
                    default => 'Administrative sign-in attempt rejected',
                },
                'module' => 'Security & Audit',
                'outcome' => $event->outcome,
                'occurredAt' => $event->created_at?->toIso8601String(),
            ])->all();

        return [
            'filters' => ['period' => $period],
            'updatedAt' => now()->toIso8601String(),
            'summary' => [
                ['key' => 'organizations', 'label' => 'Organizations', 'value' => $organizations, 'state' => 'available', 'context' => 'Governed organization records'],
                ['key' => 'users', 'label' => 'Platform Users', 'value' => $activeUsers, 'state' => 'available', 'context' => "{$superAdmins} active Super ".str('Administrator')->plural($superAdmins)],
                ['key' => 'paps', 'label' => 'PAP Workflow', 'value' => null, 'state' => 'not_configured', 'context' => 'PAP workflow records are not configured.'],
                ['key' => 'assessments', 'label' => 'Assessments', 'value' => null, 'state' => 'not_configured', 'context' => 'Assessment records are not configured.'],
                ['key' => 'subscriptions', 'label' => 'Subscriptions', 'value' => null, 'state' => 'not_configured', 'context' => 'Subscription records are not configured.'],
                ['key' => 'attention', 'label' => 'Platform Attention', 'value' => count($attention), 'state' => 'available', 'context' => "{$failedJobs} failed jobs · {$queuedJobs} queued"],
            ],
            'attention' => $attention,
            'operations' => [
                'failedJobs' => $failedJobs,
                'queuedJobs' => $queuedJobs,
                'rejectedAdministrativeLogins' => $rejectedAdministrativeLogins,
                'failedMfaAttempts' => $failedMfaAttempts,
            ],
            'health' => [
                ['service' => 'Application', 'status' => 'operational', 'detail' => 'Dashboard request completed successfully.'],
                ['service' => 'Database', 'status' => 'operational', 'detail' => 'Required dashboard queries completed successfully.'],
                ['service' => 'Queue processing', 'status' => $failedJobs > 0 ? 'attention_needed' : 'unknown', 'detail' => $failedJobs > 0 ? "{$failedJobs} failed jobs recorded." : 'No queue-worker heartbeat is configured.'],
                ['service' => 'Email delivery', 'status' => 'unknown', 'detail' => 'No delivery health check is configured.'],
                ['service' => 'AI provider', 'status' => 'not_configured', 'detail' => 'No AI request or provider model is configured.'],
                ['service' => 'Malware scanning', 'status' => 'not_configured', 'detail' => 'No malware-scanning health source is configured.'],
                ['service' => 'Backups', 'status' => 'unknown', 'detail' => 'No backup status source is configured.'],
            ],
            'recentActivity' => $recentActivity,
            'availability' => [
                'organizations' => true,
                'subscriptions' => false,
                'papWorkflow' => false,
                'assessments' => false,
                'financials' => false,
                'aiIntegrations' => false,
                'notifications' => false,
            ],
        ];
    }
}
