export type MetricValue = number | null;

export type OrganizationDashboardSummary = {
    key:
        | 'total'
        | 'screening'
        | 'assignment'
        | 'active_evaluations'
        | 'overdue_evaluations'
        | 'final_decision';
    label: string;
    value: MetricValue;
    description: string;
    tone: 'neutral' | 'warning' | 'assignment' | 'active' | 'critical';
};

export type WorkflowStage = {
    label: string;
    count: MetricValue;
    tone: string;
};

export type PriorityTask = {
    id: string;
    reference: string;
    title: string;
    office: string;
    stage: string;
    dueAt: string | null;
    reason: string;
    actionLabel: string | null;
    overdueDays: number | null;
};

export type TrendPoint = {
    period: string;
    label: string;
    count: MetricValue;
};

export type EvaluatorWorkload = {
    id: string;
    name: string;
    office: string;
    specialization: string | null;
    activeAssignments: number;
    overdueAssignments: number;
    capacity: number | null;
    availability: string;
};

export type ProcessingMetric = {
    label: string;
    value: number | null;
    unit: 'days' | 'percent' | 'cycles';
};

export type AssessmentToolUsage = {
    tool: string;
    version: string | null;
    papCount: number | null;
    completedAssessments: number | null;
};

export type FinancialSummary = {
    currency: 'PHP';
    totalCost: number | null;
    requested: number | null;
    recommended: number | null;
    approvedOrAllotted: number | null;
    gadAttributed: number | null;
    missingApprovedCount: number | null;
    directGad: number | null;
    attributableRegularProgram: number | null;
};

export type UsageItem = {
    label: string;
    used: number | null;
    limit: number | null;
    unit: string;
};

export type SubscriptionSummary = {
    plan: string | null;
    status: string | null;
    expiresAt: string | null;
    usage: UsageItem[];
};

export type DashboardNotification = {
    id: string;
    title: string;
    summary: string;
    occurredAt: string;
    read: boolean;
};

export type DashboardActivity = {
    id: string;
    description: string;
    actorCategory: string | null;
    occurredAt: string;
};

export type OrganizationDashboardData = {
    generatedAt: string | null;
    fiscalYears: number[];
    summaries: OrganizationDashboardSummary[];
    workflow: WorkflowStage[];
    priorityTasks: PriorityTask[];
    submissionTrend: TrendPoint[];
    evaluatorWorkloads: EvaluatorWorkload[];
    processingMetrics: ProcessingMetric[];
    assessmentTools: AssessmentToolUsage[];
    financial: FinancialSummary | null;
    subscription: SubscriptionSummary | null;
    notifications: DashboardNotification[];
    activities: DashboardActivity[];
    partialErrors: string[];
};

export type OrganizationDashboardOrganization = {
    id: number;
    official_name: string;
    acronym: string | null;
    code: string;
};
