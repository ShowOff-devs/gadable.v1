import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    FileText,
    RefreshCw,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { organizationAdminDashboardPreview } from '@/data/organization-admin-dashboard-preview';
import type {
    FinancialSummary,
    MetricValue,
    OrganizationDashboardData,
    OrganizationDashboardOrganization,
    OrganizationDashboardSummary,
    UsageItem,
} from '@/types/organization-admin-dashboard';

type Props = {
    organization: OrganizationDashboardOrganization;
    dashboard: OrganizationDashboardData | null;
    previewMode: boolean;
};

const pesoFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const summaryIcons = {
    total: FileText,
    screening: ClipboardCheck,
    assignment: Users,
    active_evaluations: Clock3,
    overdue_evaluations: AlertTriangle,
    final_decision: CheckCircle2,
};

const toneClasses: Record<OrganizationDashboardSummary['tone'], string> = {
    neutral: 'border-brand-border bg-white text-brand-purple',
    warning: 'border-amber-200 bg-amber-50/60 text-amber-800',
    assignment: 'border-fuchsia-200 bg-fuchsia-50/50 text-fuchsia-800',
    active: 'border-blue-200 bg-blue-50/50 text-blue-800',
    critical: 'border-red-200 bg-red-50/60 text-red-800',
};

function valueOrUnavailable(value: MetricValue): string {
    return value === null ? '—' : value.toLocaleString('en-PH');
}

function formatMoney(value: number | null): string {
    return value === null ? 'Unavailable' : pesoFormatter.format(value);
}

function EmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-dashed border-brand-border bg-brand-soft/60 px-5 py-8 text-center">
            <CheckCircle2
                className="mx-auto size-7 text-brand-purple"
                aria-hidden="true"
            />
            <p className="mt-3 font-semibold">{title}</p>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
                {description}
            </p>
        </div>
    );
}

function UnavailableState({ description }: { description: string }) {
    return (
        <div className="rounded-xl border border-brand-border bg-brand-soft/60 px-5 py-7">
            <p className="font-semibold">Data unavailable</p>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
                {description}
            </p>
        </div>
    );
}

function Panel({
    title,
    description,
    children,
    className = '',
}: {
    title: string;
    description: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`min-w-0 rounded-2xl border border-brand-border bg-white p-5 shadow-sm sm:p-6 ${className}`}
        >
            <header>
                <h2 className="text-lg font-semibold tracking-tight">
                    {title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-brand-muted">
                    {description}
                </p>
            </header>
            <div className="mt-5">{children}</div>
        </section>
    );
}

function SummaryCards({ items }: { items: OrganizationDashboardSummary[] }) {
    return (
        <section aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="sr-only">
                Organization workflow summary
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                {items.map((item) => {
                    const Icon = summaryIcons[item.key];

                    return (
                        <article
                            key={item.key}
                            className={`rounded-2xl border p-4 shadow-sm ${toneClasses[item.tone]}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold text-brand-text">
                                    {item.label}
                                </p>
                                <Icon
                                    className="size-5 shrink-0"
                                    aria-hidden="true"
                                />
                            </div>
                            <p
                                className="mt-4 text-3xl font-semibold text-brand-text"
                                aria-label={`${item.label}: ${item.value === null ? 'unavailable' : item.value}`}
                            >
                                {valueOrUnavailable(item.value)}
                            </p>
                            <p className="mt-2 text-xs leading-5 text-brand-muted">
                                {item.description}
                            </p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

function FinancialPanel({ financial }: { financial: FinancialSummary | null }) {
    if (!financial) {
        return (
            <UnavailableState description="Financial-summary records are not configured for this organization." />
        );
    }

    const comparison = [
        {
            label: 'Requested',
            value: financial.requested,
            className: 'bg-brand-purple',
        },
        {
            label: 'Approved or allotted',
            value: financial.approvedOrAllotted,
            className: 'bg-emerald-600',
        },
    ];
    const maximum = Math.max(...comparison.map((item) => item.value ?? 0), 1);

    return (
        <div className="grid gap-6">
            <div className="grid gap-3 sm:grid-cols-2">
                {[
                    ['Total PAP cost', financial.totalCost],
                    ['Requested amount', financial.requested],
                    ['Recommended amount', financial.recommended],
                    ['Approved or allotted', financial.approvedOrAllotted],
                    ['Approved GAD-attributed', financial.gadAttributed],
                    [
                        'Missing approved amounts',
                        financial.missingApprovedCount,
                    ],
                ].map(([label, value]) => (
                    <div
                        key={String(label)}
                        className="rounded-xl border border-brand-border p-3"
                    >
                        <p className="text-xs font-semibold text-brand-muted">
                            {label}
                        </p>
                        <p className="mt-1 font-semibold">
                            {label === 'Missing approved amounts'
                                ? valueOrUnavailable(value as number | null)
                                : formatMoney(value as number | null)}
                        </p>
                    </div>
                ))}
            </div>
            <div
                role="img"
                aria-label={`Requested ${formatMoney(financial.requested)} compared with approved or allotted ${formatMoney(financial.approvedOrAllotted)}`}
                className="grid gap-3"
            >
                {comparison.map((item) => (
                    <div key={item.label}>
                        <div className="flex justify-between gap-3 text-xs">
                            <span>{item.label}</span>
                            <strong>{formatMoney(item.value)}</strong>
                        </div>
                        <div className="mt-1 h-3 overflow-hidden rounded-full bg-brand-soft">
                            <div
                                className={`h-full rounded-full ${item.className}`}
                                style={{
                                    width:
                                        item.value === null
                                            ? '0%'
                                            : `${(item.value / maximum) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs leading-5 text-brand-muted">
                Summary only. Recommended, approved or allotted, and
                GAD-attributed amounts remain distinct. No payment, release,
                obligation, or accounting transactions are included.
            </p>
        </div>
    );
}

function UsageRow({ item }: { item: UsageItem }) {
    const hasPercentage =
        item.used !== null && item.limit !== null && item.limit > 0;
    const percentage = hasPercentage
        ? Math.min((item.used! / item.limit!) * 100, 100)
        : null;

    return (
        <li className="grid gap-2">
            <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-brand-muted">
                    {item.used === null
                        ? 'Usage unavailable'
                        : `${item.used.toLocaleString()} ${item.unit}`}
                    {item.limit !== null
                        ? ` of ${item.limit.toLocaleString()}`
                        : ' · limit unavailable'}
                </span>
            </div>
            {percentage !== null && (
                <div
                    className="h-2 overflow-hidden rounded-full bg-brand-soft"
                    role="progressbar"
                    aria-label={`${item.label} usage`}
                    aria-valuenow={Math.round(percentage)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className="h-full rounded-full bg-brand-purple"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            )}
        </li>
    );
}

export default function OrganizationAdminDashboard({
    organization,
    dashboard,
    previewMode,
}: Props) {
    const data =
        dashboard ??
        (previewMode && import.meta.env.DEV
            ? organizationAdminDashboardPreview
            : null);
    const [fiscalYear, setFiscalYear] = useState(
        String(data?.fiscalYears[0] ?? new Date().getFullYear()),
    );
    const [stage, setStage] = useState('');
    const activeFilterCount =
        Number(stage !== '') +
        Number(
            fiscalYear !==
                String(data?.fiscalYears[0] ?? new Date().getFullYear()),
        );
    const totalWorkflow = useMemo(
        () =>
            data?.workflow.reduce(
                (total, item) => total + (item.count ?? 0),
                0,
            ) ?? 0,
        [data],
    );
    const maximumTrend = Math.max(
        ...(data?.submissionTrend.map((item) => item.count ?? 0) ?? [0]),
        1,
    );

    return (
        <>
            <Head title="Organization Dashboard | GADable" />
            <div className="mx-auto w-full max-w-[100rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-bold tracking-[0.14em] text-brand-magenta uppercase">
                            Organization Admin Portal
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Organization Dashboard
                        </h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-muted sm:text-base">
                            Monitor your organization’s PAP workflow, Evaluator
                            assignments, financial summaries, and platform
                            usage.
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                            <span className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-3 py-1.5 font-semibold">
                                <Building2Icon /> {organization.official_name}
                            </span>
                            <span className="rounded-full border border-brand-border bg-white px-3 py-1.5 text-brand-muted">
                                FY {fiscalYear}
                            </span>
                            {data?.generatedAt && (
                                <span className="text-xs text-brand-muted">
                                    Updated{' '}
                                    {dateFormatter.format(
                                        new Date(data.generatedAt),
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-brand-border bg-white px-4 text-sm font-semibold text-brand-muted disabled:opacity-60"
                        title="Live refresh is not configured"
                    >
                        <RefreshCw className="size-4" aria-hidden="true" />{' '}
                        Refresh unavailable
                    </button>
                </header>

                {previewMode && import.meta.env.DEV && dashboard === null && (
                    <div
                        className="mt-6 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm leading-6 text-purple-900"
                        role="status"
                    >
                        <strong>Development preview.</strong> Clearly labeled
                        demonstration records are shown because operational
                        dashboard services are not configured.
                    </div>
                )}

                <section
                    aria-labelledby="filters-heading"
                    className="mt-6 rounded-2xl border border-brand-border bg-white p-4 shadow-sm"
                >
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="min-w-44 flex-1">
                            <label
                                id="filters-heading"
                                htmlFor="fiscal-year"
                                className="text-xs font-semibold text-brand-muted"
                            >
                                Fiscal year
                            </label>
                            <select
                                id="fiscal-year"
                                value={fiscalYear}
                                onChange={(event) =>
                                    setFiscalYear(event.target.value)
                                }
                                className="mt-1 min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 focus-visible:ring-3 focus-visible:ring-brand-purple/20 focus-visible:outline-none"
                            >
                                {(
                                    data?.fiscalYears ?? [
                                        new Date().getFullYear(),
                                    ]
                                ).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="min-w-52 flex-1">
                            <label
                                htmlFor="workflow-stage"
                                className="text-xs font-semibold text-brand-muted"
                            >
                                Workflow stage
                            </label>
                            <select
                                id="workflow-stage"
                                value={stage}
                                onChange={(event) =>
                                    setStage(event.target.value)
                                }
                                className="mt-1 min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 focus-visible:ring-3 focus-visible:ring-brand-purple/20 focus-visible:outline-none"
                            >
                                <option value="">All configured stages</option>
                                {data?.workflow.map((item) => (
                                    <option key={item.label} value={item.label}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="min-w-52 flex-1">
                            <label
                                htmlFor="office"
                                className="text-xs font-semibold text-brand-muted"
                            >
                                Office, unit, or cluster
                            </label>
                            <select
                                id="office"
                                disabled
                                className="mt-1 min-h-11 w-full rounded-lg border border-brand-border bg-brand-soft px-3 text-brand-muted"
                            >
                                <option>Not configured</option>
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setFiscalYear(
                                    String(
                                        data?.fiscalYears[0] ??
                                            new Date().getFullYear(),
                                    ),
                                );
                                setStage('');
                            }}
                            disabled={activeFilterCount === 0}
                            className="min-h-11 rounded-lg px-4 text-sm font-semibold text-brand-purple underline underline-offset-4 disabled:text-brand-muted disabled:no-underline"
                        >
                            Clear filters
                        </button>
                    </div>
                    <p
                        className="mt-3 text-xs text-brand-muted"
                        aria-live="polite"
                    >
                        {activeFilterCount > 0
                            ? `${activeFilterCount} dashboard filter${activeFilterCount > 1 ? 's' : ''} active.`
                            : 'Showing the default authorized organization scope.'}
                    </p>
                </section>

                {!data ? (
                    <div className="mt-6">
                        <UnavailableState description="Operational PAP, evaluation, financial, subscription, notification, and activity data services are not configured." />
                    </div>
                ) : (
                    <div className="mt-6 grid gap-6">
                        <SummaryCards items={data.summaries} />

                        {data.partialErrors.length > 0 && (
                            <div
                                role="alert"
                                className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
                            >
                                Some panels could not be updated. Available
                                sections remain visible.
                            </div>
                        )}

                        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                            <Panel
                                title="Priority Work Queue"
                                description="Administrative tasks requiring timely organization-level attention."
                            >
                                {data.priorityTasks.length === 0 ? (
                                    <EmptyState
                                        title="No pending administrative work"
                                        description="No urgent screening, assignment, or overdue workflow tasks were returned."
                                    />
                                ) : (
                                    <div className="grid gap-3">
                                        {data.priorityTasks.map((task) => (
                                            <article
                                                key={task.id}
                                                className="rounded-xl border border-brand-border p-4"
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-xs font-bold text-brand-purple">
                                                                {task.reference}
                                                            </span>
                                                            <span className="rounded-full border border-brand-border bg-brand-soft px-2 py-0.5 text-xs">
                                                                {task.stage}
                                                            </span>
                                                            {task.overdueDays !==
                                                                null && (
                                                                <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-800">
                                                                    Overdue by{' '}
                                                                    {
                                                                        task.overdueDays
                                                                    }{' '}
                                                                    days
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="mt-2 font-semibold break-words">
                                                            {task.title}
                                                        </h3>
                                                        <p className="mt-1 text-xs text-brand-muted">
                                                            {task.office}
                                                        </p>
                                                        <p className="mt-2 text-sm leading-6 text-brand-muted">
                                                            {task.reason}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled
                                                        title="Destination module is not configured"
                                                        className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-brand-border px-3 text-sm font-semibold text-brand-purple disabled:opacity-60"
                                                    >
                                                        {task.actionLabel ??
                                                            'Open record'}{' '}
                                                        <ArrowRight
                                                            className="size-4"
                                                            aria-hidden="true"
                                                        />
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </Panel>

                            <Panel
                                title="Workflow Status"
                                description="Distribution across canonical grouped workflow stages."
                            >
                                {data.workflow.length === 0 ? (
                                    <UnavailableState description="No workflow-status aggregates are available." />
                                ) : (
                                    <div className="grid gap-4">
                                        {data.workflow.map((item) => {
                                            const percentage =
                                                item.count !== null &&
                                                totalWorkflow > 0
                                                    ? (item.count /
                                                          totalWorkflow) *
                                                      100
                                                    : null;

                                            return (
                                                <div key={item.label}>
                                                    <div className="flex justify-between gap-3 text-sm">
                                                        <span>
                                                            {item.label}
                                                        </span>
                                                        <strong>
                                                            {valueOrUnavailable(
                                                                item.count,
                                                            )}
                                                            {percentage !== null
                                                                ? ` · ${Math.round(percentage)}%`
                                                                : ''}
                                                        </strong>
                                                    </div>
                                                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-brand-soft">
                                                        <div
                                                            className={`h-full rounded-full ${item.tone}`}
                                                            style={{
                                                                width: `${percentage ?? 0}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </Panel>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <Panel
                                title="PAP Submission Trend"
                                description={`Confirmed submissions by month for fiscal year ${fiscalYear}.`}
                            >
                                {data.submissionTrend.length === 0 ? (
                                    <EmptyState
                                        title="No submission trend"
                                        description="No confirmed submission periods are available."
                                    />
                                ) : (
                                    <>
                                        <div
                                            className="flex h-48 items-end gap-2"
                                            role="img"
                                            aria-label="Monthly PAP submission counts"
                                        >
                                            {data.submissionTrend.map(
                                                (point) => (
                                                    <div
                                                        key={point.period}
                                                        className="flex h-full min-w-0 flex-1 flex-col justify-end text-center"
                                                    >
                                                        <span className="mb-1 text-xs font-semibold">
                                                            {valueOrUnavailable(
                                                                point.count,
                                                            )}
                                                        </span>
                                                        <div
                                                            className="mx-auto w-full max-w-10 rounded-t-md bg-brand-purple"
                                                            style={{
                                                                height:
                                                                    point.count ===
                                                                    null
                                                                        ? '0%'
                                                                        : `${Math.max((point.count / maximumTrend) * 100, 5)}%`,
                                                            }}
                                                        />
                                                        <span className="mt-2 text-[0.68rem] text-brand-muted">
                                                            {point.label}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                        <table className="sr-only">
                                            <caption>
                                                Accessible PAP submission trend
                                                data
                                            </caption>
                                            <tbody>
                                                {data.submissionTrend.map(
                                                    (point) => (
                                                        <tr key={point.period}>
                                                            <th>
                                                                {point.label}
                                                            </th>
                                                            <td>
                                                                {valueOrUnavailable(
                                                                    point.count,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                            </Panel>

                            <Panel
                                title="Evaluator Workload"
                                description="Current assignments compared with configured workload capacity."
                            >
                                {data.evaluatorWorkloads.length === 0 ? (
                                    <EmptyState
                                        title="No Evaluators available"
                                        description="No authorized workload records were returned."
                                    />
                                ) : (
                                    <div className="grid gap-4">
                                        {data.evaluatorWorkloads.map(
                                            (evaluator) => {
                                                const percentage =
                                                    evaluator.capacity &&
                                                    evaluator.capacity > 0
                                                        ? Math.min(
                                                              (evaluator.activeAssignments /
                                                                  evaluator.capacity) *
                                                                  100,
                                                              100,
                                                          )
                                                        : null;

                                                return (
                                                    <article
                                                        key={evaluator.id}
                                                        className="rounded-xl border border-brand-border p-3"
                                                    >
                                                        <div className="flex flex-wrap justify-between gap-3">
                                                            <div>
                                                                <h3 className="font-semibold">
                                                                    {
                                                                        evaluator.name
                                                                    }
                                                                </h3>
                                                                <p className="text-xs text-brand-muted">
                                                                    {
                                                                        evaluator.office
                                                                    }{' '}
                                                                    ·{' '}
                                                                    {evaluator.specialization ??
                                                                        'Specialization unavailable'}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs font-semibold">
                                                                {
                                                                    evaluator.availability
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="mt-3 flex justify-between text-xs">
                                                            <span>
                                                                {
                                                                    evaluator.activeAssignments
                                                                }{' '}
                                                                active ·{' '}
                                                                {
                                                                    evaluator.overdueAssignments
                                                                }{' '}
                                                                overdue
                                                            </span>
                                                            <span>
                                                                {evaluator.capacity ===
                                                                null
                                                                    ? 'Capacity unknown'
                                                                    : `${evaluator.activeAssignments} of ${evaluator.capacity}`}
                                                            </span>
                                                        </div>
                                                        {percentage !==
                                                            null && (
                                                            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-brand-soft">
                                                                <div
                                                                    className="h-full rounded-full bg-brand-purple"
                                                                    style={{
                                                                        width: `${percentage}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </article>
                                                );
                                            },
                                        )}
                                    </div>
                                )}
                            </Panel>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <Panel
                                title="PAP Financial Summary"
                                description={`Organization-scoped monitoring totals for fiscal year ${fiscalYear}.`}
                            >
                                <FinancialPanel financial={data.financial} />
                            </Panel>
                            <Panel
                                title="Subscription and Platform Usage"
                                description="Subscription state and available platform-consumption information."
                            >
                                {!data.subscription ? (
                                    <UnavailableState description="Subscription and usage services are not configured." />
                                ) : (
                                    <div>
                                        <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-brand-border p-4">
                                            <div>
                                                <p className="text-xs font-semibold text-brand-muted">
                                                    Current plan
                                                </p>
                                                <p className="mt-1 font-semibold">
                                                    {data.subscription.plan ??
                                                        'Plan unavailable'}
                                                </p>
                                            </div>
                                            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                                                {data.subscription.status ??
                                                    'Status unknown'}
                                            </span>
                                        </div>
                                        <ul className="mt-5 grid gap-4">
                                            {data.subscription.usage.map(
                                                (item) => (
                                                    <UsageRow
                                                        key={item.label}
                                                        item={item}
                                                    />
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </Panel>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <Panel
                                title="Processing and Completion"
                                description="Available operational timing and completion indicators."
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {data.processingMetrics.map((metric) => (
                                        <div
                                            key={metric.label}
                                            className="rounded-xl border border-brand-border p-4"
                                        >
                                            <p className="text-xs text-brand-muted">
                                                {metric.label}
                                            </p>
                                            <p className="mt-2 text-xl font-semibold">
                                                {metric.value === null
                                                    ? 'Unavailable'
                                                    : `${metric.value}${metric.unit === 'percent' ? '%' : ` ${metric.unit}`}`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                            <Panel
                                title="Assessment Tool Insights"
                                description="Authorized tool-version use; scores are not combined across instruments."
                            >
                                {data.assessmentTools.length === 0 ? (
                                    <UnavailableState description="Assessment-tool usage is not available." />
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[28rem] text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-brand-border">
                                                    <th className="pb-2">
                                                        Tool
                                                    </th>
                                                    <th className="pb-2">
                                                        PAPs
                                                    </th>
                                                    <th className="pb-2">
                                                        Completed
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.assessmentTools.map(
                                                    (tool) => (
                                                        <tr
                                                            key={`${tool.tool}-${tool.version}`}
                                                            className="border-b border-brand-border/70"
                                                        >
                                                            <th className="py-3">
                                                                <span className="block">
                                                                    {tool.tool}
                                                                </span>
                                                                <span className="text-xs font-normal text-brand-muted">
                                                                    {tool.version ??
                                                                        'Version unavailable'}
                                                                </span>
                                                            </th>
                                                            <td>
                                                                {valueOrUnavailable(
                                                                    tool.papCount,
                                                                )}
                                                            </td>
                                                            <td>
                                                                {valueOrUnavailable(
                                                                    tool.completedAssessments,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Panel>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <Panel
                                title="Recent Notifications"
                                description="Organization-scoped workflow notices returned for this session."
                            >
                                {data.notifications.length === 0 ? (
                                    <EmptyState
                                        title="No recent notifications"
                                        description="No authorized notices were returned."
                                    />
                                ) : (
                                    <ul className="grid gap-3">
                                        {data.notifications.map((notice) => (
                                            <li
                                                key={notice.id}
                                                className={`rounded-xl border p-4 ${notice.read ? 'border-brand-border' : 'border-purple-200 bg-purple-50/60'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">
                                                        {notice.title}
                                                    </span>
                                                    {!notice.read && (
                                                        <span className="rounded-full bg-brand-purple px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                                                            Unread
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm leading-6 text-brand-muted">
                                                    {notice.summary}
                                                </p>
                                                <time
                                                    className="mt-2 block text-xs text-brand-muted"
                                                    dateTime={notice.occurredAt}
                                                >
                                                    {dateFormatter.format(
                                                        new Date(
                                                            notice.occurredAt,
                                                        ),
                                                    )}
                                                </time>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Panel>
                            <Panel
                                title="Recent Organization Activity"
                                description="Recent administrative and workflow events within the selected tenant."
                            >
                                {data.activities.length === 0 ? (
                                    <EmptyState
                                        title="No recent activity"
                                        description="No authorized activity events were returned."
                                    />
                                ) : (
                                    <ol className="grid gap-4 border-l border-brand-border pl-5">
                                        {data.activities.map((activity) => (
                                            <li
                                                key={activity.id}
                                                className="relative"
                                            >
                                                <span
                                                    className="absolute top-1.5 -left-[1.48rem] size-2.5 rounded-full bg-brand-purple"
                                                    aria-hidden="true"
                                                />
                                                <p className="text-sm font-medium">
                                                    {activity.description}
                                                </p>
                                                <p className="mt-1 text-xs text-brand-muted">
                                                    <time
                                                        dateTime={
                                                            activity.occurredAt
                                                        }
                                                    >
                                                        {dateFormatter.format(
                                                            new Date(
                                                                activity.occurredAt,
                                                            ),
                                                        )}
                                                    </time>
                                                    {activity.actorCategory
                                                        ? ` · ${activity.actorCategory}`
                                                        : ''}
                                                </p>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </Panel>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function Building2Icon() {
    return (
        <span
            className="inline-flex size-5 items-center justify-center rounded bg-brand-purple text-[0.65rem] font-bold text-white"
            aria-hidden="true"
        >
            O
        </span>
    );
}
