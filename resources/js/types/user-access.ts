export type UserAccessSummary = {
    id: number;
    name: string;
    email: string;
    reference: string;
    accountType: string;
    accountStatus: string;
    verificationStatus: 'verified' | 'pending';
    mfaStatus: 'enrolled' | 'not_enrolled';
    organizations: {
        id: number;
        name: string;
        membershipStatus: string;
    }[];
    activeSessions: number;
    lastLoginAt: string | null;
};

export type PaginatedUsers = {
    data: UserAccessSummary[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    from: number | null;
    to: number | null;
};

export type UserAccessDetail = UserAccessSummary & {
    createdAt: string | null;
    memberships: {
        id: number;
        organization: {
            id: number;
            name: string;
            code: string;
            status: string;
        };
        status: string;
        startedAt: string | null;
        endedAt: string | null;
        designations: {
            id: number;
            type: string;
            status: string;
            effectiveAt: string;
            expiresAt: string | null;
            authorityDocumented: boolean;
        }[];
    }[];
    sessions: {
        current: boolean;
        lastActivityAt: string;
        deviceSummary: string;
    }[];
    activity: {
        id: number;
        type: string;
        outcome: string;
        occurredAt: string | null;
    }[];
};
