export type AvailabilityState = 'available' | 'not_configured';
export type AttentionSeverity =
    'critical' | 'high' | 'medium' | 'informational';
export type HealthStatus =
    | 'operational'
    | 'degraded'
    | 'attention_needed'
    | 'unavailable'
    | 'not_configured'
    | 'unknown';

export type PlatformSummary = {
    key: string;
    label: string;
    value: number | null;
    state: AvailabilityState;
    context: string;
};

export type AttentionItem = {
    id: string;
    severity: AttentionSeverity;
    title: string;
    description: string;
    module: string;
    occurredAt: string;
};

export type ServiceHealth = {
    service: string;
    status: HealthStatus;
    detail: string;
};

export type PlatformActivity = {
    id: string;
    description: string;
    module: string;
    outcome: string;
    occurredAt: string | null;
};

export type SuperAdminDashboardData = {
    filters: { period: '24h' | '7d' | '30d' };
    updatedAt: string;
    summary: PlatformSummary[];
    attention: AttentionItem[];
    operations: {
        failedJobs: number;
        queuedJobs: number;
        rejectedAdministrativeLogins: number;
        failedMfaAttempts: number;
    };
    health: ServiceHealth[];
    recentActivity: PlatformActivity[];
    availability: Record<string, boolean>;
};
