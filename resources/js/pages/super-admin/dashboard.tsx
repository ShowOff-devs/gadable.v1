import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Database,
    RefreshCw,
    ServerCog,
    ShieldAlert,
} from 'lucide-react';
import type {
    AttentionSeverity,
    HealthStatus,
    SuperAdminDashboardData,
} from '@/types';
import { dashboard as dashboardRoute } from '@/routes/super-admin';

type Props = {
    dashboard: SuperAdminDashboardData;
};

const periodOptions = [
    { value: '24h', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
] as const;

function formatDateTime(value: string | null) {
    if (!value) {
        return 'Time unavailable';
    }

    return new Intl.DateTimeFormat('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function statusLabel(status: HealthStatus) {
    return {
        operational: 'Operational',
        degraded: 'Degraded',
        attention_needed: 'Attention Needed',
        unavailable: 'Unavailable',
        not_configured: 'Not Configured',
        unknown: 'Unknown',
    }[status];
}

function severityLabel(severity: AttentionSeverity) {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function UnsupportedSection({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <section className="rounded-xl border border-brand-border bg-white p-5 sm:p-6">
            <h2 className="font-semibold">{title}</h2>
            <div className="mt-4 rounded-lg border border-dashed border-brand-border bg-brand-soft/60 p-5">
                <p className="text-sm font-semibold">Not configured</p>
                <p className="mt-1 text-sm leading-6 text-brand-muted">
                    {description}
                </p>
            </div>
        </section>
    );
}

export default function PlatformDashboard({ dashboard }: Props) {
    function updatePeriod(period: '24h' | '7d' | '30d') {
        router.get(
            dashboardRoute().url,
            { period },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['dashboard'],
            },
        );
    }

    function refresh() {
        router.reload({ only: ['dashboard'] });
    }

    return (
        <>
            <Head title="Platform Dashboard | GADable">
                <meta name="robots" content="noindex, nofollow, noarchive" />
            </Head>
            <a
                href="#main-content"
                className="fixed top-3 left-3 z-50 -translate-y-24 rounded-md bg-brand-deep px-4 py-3 text-sm font-semibold text-white focus:translate-y-0 focus-visible:ring-3 focus-visible:ring-brand-purple/30 focus-visible:outline-none"
            >
                Skip to dashboard content
            </a>

            <div className="mx-auto w-full max-w-[100rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
                    <div>
                        <p className="text-xs font-bold tracking-[0.15em] text-brand-magenta uppercase">
                            GADable Platform Governance
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                            Platform Dashboard
                        </h1>
                        <p className="mt-2 max-w-3xl leading-7 text-brand-muted">
                            Monitor organizations, subscriptions, platform
                            activity, security, and services across GADable.
                        </p>
                        <p className="mt-2 text-xs text-brand-muted">
                            Last updated{' '}
                            <time dateTime={dashboard.updatedAt}>
                                {formatDateTime(dashboard.updatedAt)}
                            </time>
                        </p>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <label className="grid gap-1.5 text-sm font-semibold">
                            Reporting period
                            <select
                                value={dashboard.filters.period}
                                onChange={(event) =>
                                    updatePeriod(
                                        event.target.value as
                                            '24h' | '7d' | '30d',
                                    )
                                }
                                className="min-h-11 rounded-lg border border-brand-border bg-white px-3 text-sm focus-visible:ring-3 focus-visible:ring-brand-purple/25 focus-visible:outline-none"
                            >
                                {periodOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button
                            type="button"
                            onClick={refresh}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-border bg-white px-4 text-sm font-semibold hover:bg-brand-soft focus-visible:ring-3 focus-visible:ring-brand-purple/25 focus-visible:outline-none"
                        >
                            <RefreshCw className="size-4" aria-hidden="true" />
                            Refresh
                        </button>
                    </div>
                </header>

                <section aria-labelledby="summary-heading" className="mt-7">
                    <h2 id="summary-heading" className="sr-only">
                        Platform summary
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                        {dashboard.summary.map((item) => (
                            <article
                                key={item.key}
                                className="min-w-0 rounded-xl border border-brand-border bg-white p-5"
                            >
                                <p className="text-sm font-semibold text-brand-muted">
                                    {item.label}
                                </p>
                                <p className="mt-3 text-3xl font-semibold tracking-tight">
                                    {item.value ?? '—'}
                                </p>
                                <p className="mt-2 text-xs leading-5 text-brand-muted">
                                    {item.state === 'not_configured' && (
                                        <strong className="text-brand-text">
                                            Not configured.{' '}
                                        </strong>
                                    )}
                                    {item.context}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <section
                    aria-labelledby="attention-heading"
                    className="mt-6 rounded-xl border border-brand-border bg-white p-5 shadow-sm sm:p-6"
                >
                    <div className="flex items-start gap-3">
                        <ShieldAlert
                            className="mt-0.5 size-6 shrink-0 text-brand-purple"
                            aria-hidden="true"
                        />
                        <div>
                            <h2
                                id="attention-heading"
                                className="text-xl font-semibold"
                            >
                                Attention Required
                            </h2>
                            <p className="mt-1 text-sm text-brand-muted">
                                Prioritized operational and administrative
                                security signals.
                            </p>
                        </div>
                    </div>
                    {dashboard.attention.length === 0 ? (
                        <div className="mt-5 flex items-start gap-3 rounded-lg bg-emerald-50 p-4 text-emerald-950">
                            <CheckCircle2
                                className="mt-0.5 size-5 shrink-0"
                                aria-hidden="true"
                            />
                            <p className="text-sm leading-6">
                                No urgent platform actions require your
                                attention. Services without configured health
                                checks remain listed as unknown below.
                            </p>
                        </div>
                    ) : (
                        <ol className="mt-5 grid gap-3">
                            {dashboard.attention.map((item) => (
                                <li
                                    key={item.id}
                                    className="grid gap-3 rounded-lg border border-brand-border p-4 md:grid-cols-[8rem_minmax(0,1fr)_11rem]"
                                >
                                    <span className="inline-flex h-7 w-fit items-center rounded-full bg-brand-soft px-3 text-xs font-bold">
                                        {severityLabel(item.severity)}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-semibold break-words">
                                            {item.title}
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-brand-muted">
                                            {item.description}
                                        </p>
                                    </div>
                                    <div className="text-xs leading-5 text-brand-muted md:text-right">
                                        <p className="font-semibold text-brand-text">
                                            {item.module}
                                        </p>
                                        <time dateTime={item.occurredAt}>
                                            {formatDateTime(item.occurredAt)}
                                        </time>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </section>

                <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
                    <UnsupportedSection
                        title="Organization & Subscription Overview"
                        description="Organization, onboarding, subscription, and quota models are not yet available."
                    />
                    <UnsupportedSection
                        title="PAP Workflow Overview"
                        description="PAP and workflow models are not yet available, so no workflow counts or confidential content are sent."
                    />
                    <UnsupportedSection
                        title="Assessment Tool Status"
                        description="Assessment-tool and frozen-version records are not yet available."
                    />
                    <UnsupportedSection
                        title="Financial Snapshot"
                        description="Reliable requested, recommended, approved, allotted, and GAD-attributed fields are not yet available."
                    />
                    <UnsupportedSection
                        title="AI & Integration Status"
                        description="AI request, provider, usage, and integration-health models are not configured."
                    />

                    <section className="rounded-xl border border-brand-border bg-white p-5 sm:p-6">
                        <div className="flex items-center gap-3">
                            <ServerCog
                                className="size-5 text-brand-purple"
                                aria-hidden="true"
                            />
                            <h2 className="font-semibold">Platform Health</h2>
                        </div>
                        <ul className="mt-4 divide-y divide-brand-border">
                            {dashboard.health.map((item) => (
                                <li
                                    key={item.service}
                                    className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-start"
                                >
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {item.service}
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-brand-muted">
                                            {item.detail}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs font-bold text-brand-muted">
                                        {statusLabel(item.status)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-xl border border-brand-border bg-white p-5 sm:p-6">
                        <div className="flex items-center gap-3">
                            <Clock3
                                className="size-5 text-brand-purple"
                                aria-hidden="true"
                            />
                            <h2 className="font-semibold">
                                Recent Platform Activity
                            </h2>
                        </div>
                        {dashboard.recentActivity.length === 0 ? (
                            <p className="mt-4 rounded-lg bg-brand-soft p-4 text-sm text-brand-muted">
                                No significant platform activity is available.
                            </p>
                        ) : (
                            <ol className="mt-4 divide-y divide-brand-border">
                                {dashboard.recentActivity.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex gap-3 py-3"
                                    >
                                        <Database
                                            className="mt-0.5 size-4 shrink-0 text-brand-magenta"
                                            aria-hidden="true"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold">
                                                {item.description}
                                            </p>
                                            <p className="mt-1 text-xs text-brand-muted">
                                                {item.module} · {item.outcome}
                                                {' · '}
                                                {formatDateTime(
                                                    item.occurredAt,
                                                )}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>

                    <section className="rounded-xl border border-brand-border bg-white p-5 sm:p-6">
                        <div className="flex items-center gap-3">
                            <AlertTriangle
                                className="size-5 text-brand-purple"
                                aria-hidden="true"
                            />
                            <h2 className="font-semibold">Quick Actions</h2>
                        </div>
                        <p className="mt-4 rounded-lg border border-dashed border-brand-border bg-brand-soft/60 p-5 text-sm leading-6 text-brand-muted">
                            No additional management modules are currently
                            implemented. Actions will appear here only when
                            their authorized destination routes exist.
                        </p>
                    </section>
                </div>
            </div>
        </>
    );
}
