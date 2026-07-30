export type PapWorkflowStatus =
    | 'draft'
    | 'submitted'
    | 'under_administrative_screening'
    | 'for_assignment'
    | 'assigned'
    | 'under_evaluation'
    | 'for_revision'
    | 'evaluation_completed'
    | 'for_final_review'
    | 'approved'
    | 'conditionally_approved'
    | 'declined'
    | 'returned'
    | 'completed'
    | 'archived'
    | (string & {});

export type DashboardSummary = {
    drafts: number;
    activeSubmissions: number;
    forRevision: number;
    approved: number;
};

export type ProponentActionItem = {
    id: string;
    papReference: string;
    papTitle: string;
    requiredAction: string;
    status: PapWorkflowStatus;
    priority: 'standard' | 'high' | 'urgent';
    dueAt: string | null;
    requestingOffice: string | null;
    destination: string | null;
    actionLabel: string;
};

export type ProponentDeadline = {
    id: string;
    papReference: string;
    papTitle: string;
    deadlineType: string;
    dueAt: string;
    status: PapWorkflowStatus;
    destination: string | null;
};

export type ProponentPapSummary = {
    id: string;
    reference: string;
    title: string;
    fiscalYear: number;
    requestedAmount: number | null;
    currency: 'PHP';
    status: PapWorkflowStatus;
    updatedAt: string;
    nextAction: string | null;
    destination: string | null;
};

export type ProponentActivity = {
    id: string;
    description: string;
    papReference: string;
    occurredAt: string;
    actorCategory: string | null;
    destination: string | null;
};

export type ProponentDashboardData = {
    summary: DashboardSummary;
    actionItems: ProponentActionItem[];
    deadlines: ProponentDeadline[];
    recentPaps: ProponentPapSummary[];
    recentActivities: ProponentActivity[];
    unreadNotifications: number;
};

export type ProponentDashboardPageProps = {
    dashboard: ProponentDashboardData | null;
    previewMode: boolean;
};
