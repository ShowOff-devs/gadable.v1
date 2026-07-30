import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    CircleDot,
    ClipboardList,
    FileClock,
    FilePenLine,
    FileText,
    History,
    Inbox,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { proponentDashboardPreview } from '@/data/proponent-dashboard-preview';
import { getPapStatusPresentation } from '@/lib/pap-status';
import { dashboard } from '@/routes';
import type {
    PapWorkflowStatus,
    ProponentActionItem,
    ProponentActivity,
    ProponentDashboardData,
    ProponentDashboardPageProps,
    ProponentDeadline,
    ProponentPapSummary,
} from '@/types';

const focusClassName =
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-purple/30 focus-visible:ring-offset-2';

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeZone: 'Asia/Manila',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Manila',
});

const pesoFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
});

function formatDate(value: string): string {
    return dateFormatter.format(new Date(value));
}

function formatDateTime(value: string): string {
    return dateTimeFormatter.format(new Date(value));
}

function firstName(name: string): string {
    return name.trim().split(/\s+/)[0] || 'there';
}

function StatusBadge({ status }: { status: PapWorkflowStatus }) {
    const presentation = getPapStatusPresentation(status);

    return (
        <Badge
            variant="outline"
            className={`whitespace-normal ${presentation.className}`}
        >
            {presentation.label}
        </Badge>
    );
}

function SectionHeading({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div>
            <h2 className="text-lg font-semibold text-brand-text">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
                {description}
            </p>
        </div>
    );
}

function PendingAction({ children }: { children: ReactNode }) {
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            title="Destination is not configured"
        >
            {children}
        </Button>
    );
}

function SummaryCards({ data }: { data: ProponentDashboardData }) {
    const summaries = [
        {
            title: 'Draft PAPs',
            value: data.summary.drafts,
            description: 'Editable proposals not yet submitted',
            icon: FilePenLine,
            accent: 'text-slate-700 bg-slate-100',
        },
        {
            title: 'Active Submissions',
            value: data.summary.activeSubmissions,
            description: 'Moving through review and evaluation',
            icon: FileClock,
            accent: 'text-blue-800 bg-blue-50',
        },
        {
            title: 'For Revision',
            value: data.summary.forRevision,
            description: 'Returned for your authorized response',
            icon: AlertTriangle,
            accent: 'text-amber-900 bg-amber-50',
        },
        {
            title: 'Approved PAPs',
            value: data.summary.approved,
            description: 'Approved or conditionally approved',
            icon: CheckCircle2,
            accent: 'text-emerald-800 bg-emerald-50',
        },
    ];

    return (
        <section aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="sr-only">
                PAP summary
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {summaries.map((summary) => {
                    const Icon = summary.icon;

                    return (
                        <Card
                            key={summary.title}
                            className="gap-4 rounded-lg py-5 shadow-none"
                        >
                            <CardHeader className="flex-row items-start justify-between gap-3 px-4 sm:px-5">
                                <div className="min-w-0">
                                    <CardDescription className="font-medium text-brand-muted">
                                        {summary.title}
                                    </CardDescription>
                                    <CardTitle className="mt-2 text-3xl text-brand-text">
                                        {summary.value}
                                    </CardTitle>
                                </div>
                                <span
                                    className={`hidden size-9 shrink-0 place-items-center rounded-md sm:grid ${summary.accent}`}
                                    aria-hidden="true"
                                >
                                    <Icon className="size-4" />
                                </span>
                            </CardHeader>
                            <CardContent className="px-4 text-xs leading-5 text-brand-muted sm:px-5">
                                {summary.description}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}

function ActionRequired({
    actionItems,
}: {
    actionItems: ProponentActionItem[];
}) {
    return (
        <section
            aria-labelledby="action-required-heading"
            className="rounded-xl border border-brand-border bg-white p-5 shadow-sm sm:p-6"
        >
            <SectionHeading
                title="Action Required"
                description="PAPs that need your response, revision, or completion."
            />
            <span id="action-required-heading" className="sr-only">
                Action Required
            </span>

            {actionItems.length === 0 ? (
                <div className="mt-6 rounded-lg border border-dashed border-brand-border bg-brand-soft p-8 text-center">
                    <CheckCircle2
                        className="mx-auto size-8 text-brand-purple"
                        aria-hidden="true"
                    />
                    <h3 className="mt-3 font-semibold text-brand-text">
                        You’re all caught up
                    </h3>
                    <p className="mt-2 text-sm text-brand-muted">
                        There are currently no PAPs requiring your immediate
                        action.
                    </p>
                </div>
            ) : (
                <div className="mt-5 grid gap-3">
                    {actionItems.map((item) => (
                        <article
                            key={item.id}
                            className="grid gap-4 rounded-lg border border-brand-border p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-xs font-semibold text-brand-purple">
                                        {item.papReference}
                                    </span>
                                    <StatusBadge status={item.status} />
                                    <Badge
                                        variant="outline"
                                        className={
                                            item.priority === 'urgent'
                                                ? 'border-red-200 bg-red-50 text-red-800'
                                                : item.priority === 'high'
                                                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                                                  : 'border-neutral-200 bg-neutral-50 text-neutral-700'
                                        }
                                    >
                                        {item.priority === 'urgent'
                                            ? 'Urgent priority'
                                            : item.priority === 'high'
                                              ? 'High priority'
                                              : 'Standard priority'}
                                    </Badge>
                                </div>
                                <h3 className="mt-3 font-semibold break-words text-brand-text">
                                    {item.papTitle}
                                </h3>
                                <p className="mt-1 text-sm leading-6 text-brand-muted">
                                    {item.requiredAction}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-brand-muted">
                                    <span>
                                        Due:{' '}
                                        {item.dueAt
                                            ? formatDate(item.dueAt)
                                            : 'No deadline assigned'}
                                    </span>
                                    {item.requestingOffice && (
                                        <span>{item.requestingOffice}</span>
                                    )}
                                </div>
                            </div>
                            {item.destination ? (
                                <Button asChild size="sm">
                                    <Link
                                        href={item.destination}
                                        className={focusClassName}
                                    >
                                        {item.actionLabel}
                                    </Link>
                                </Button>
                            ) : (
                                <PendingAction>
                                    {item.actionLabel}
                                </PendingAction>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

function UpcomingDeadlines({ deadlines }: { deadlines: ProponentDeadline[] }) {
    return (
        <section
            aria-labelledby="deadlines-heading"
            className="rounded-xl border border-brand-border bg-white p-5 sm:p-6"
        >
            <div className="flex items-start gap-3">
                <CalendarDays
                    className="mt-0.5 size-5 shrink-0 text-brand-purple"
                    aria-hidden="true"
                />
                <div>
                    <h2
                        id="deadlines-heading"
                        className="font-semibold text-brand-text"
                    >
                        Upcoming Deadlines
                    </h2>
                    <p className="mt-1 text-sm text-brand-muted">
                        Authorized dates requiring your attention.
                    </p>
                </div>
            </div>

            {deadlines.length === 0 ? (
                <p className="mt-6 rounded-lg bg-brand-soft p-5 text-sm text-brand-muted">
                    No upcoming deadlines are currently available.
                </p>
            ) : (
                <ol className="mt-5 grid gap-4">
                    {deadlines.map((deadline) => (
                        <li
                            key={deadline.id}
                            className="border-l-2 border-brand-border pl-4"
                        >
                            <p className="text-xs font-semibold text-brand-purple">
                                {deadline.papReference}
                            </p>
                            <h3 className="mt-1 text-sm font-semibold break-words text-brand-text">
                                {deadline.deadlineType}
                            </h3>
                            <p className="mt-1 text-sm text-brand-muted">
                                {deadline.papTitle}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <time
                                    dateTime={deadline.dueAt}
                                    className="text-xs font-medium text-brand-text"
                                >
                                    {formatDate(deadline.dueAt)}
                                </time>
                                <StatusBadge status={deadline.status} />
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}

function RecentPaps({ records }: { records: ProponentPapSummary[] }) {
    if (records.length === 0) {
        return (
            <section className="rounded-xl border border-brand-border bg-white p-6">
                <SectionHeading
                    title="My Recent PAPs"
                    description="Your latest owned or delegated PAP records."
                />
                <div className="mt-6 rounded-lg bg-brand-soft p-8 text-center">
                    <Inbox
                        className="mx-auto size-8 text-brand-muted"
                        aria-hidden="true"
                    />
                    <p className="mt-3 font-semibold text-brand-text">
                        No PAP records yet
                    </p>
                    <p className="mt-2 text-sm text-brand-muted">
                        Authorized records will appear here when the dashboard
                        backend is connected.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section
            aria-labelledby="recent-paps-heading"
            className="rounded-xl border border-brand-border bg-white p-5 sm:p-6"
        >
            <SectionHeading
                title="My Recent PAPs"
                description="Your latest owned or delegated PAP records."
            />
            <span id="recent-paps-heading" className="sr-only">
                My Recent PAPs
            </span>

            <div className="mt-5 grid gap-3 md:hidden">
                {records.map((record) => (
                    <article
                        key={record.id}
                        className="rounded-lg border border-brand-border p-4"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono text-xs font-semibold text-brand-purple">
                                {record.reference}
                            </span>
                            <StatusBadge status={record.status} />
                        </div>
                        <h3 className="mt-3 font-semibold break-words text-brand-text">
                            {record.title}
                        </h3>
                        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <dt className="text-xs text-brand-muted">
                                    Fiscal year
                                </dt>
                                <dd className="mt-1 font-medium">
                                    {record.fiscalYear}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-brand-muted">
                                    Requested amount
                                </dt>
                                <dd className="mt-1 font-medium break-words">
                                    {record.requestedAmount === null
                                        ? 'Not provided'
                                        : pesoFormatter.format(
                                              record.requestedAmount,
                                          )}
                                </dd>
                            </div>
                            <div className="col-span-2">
                                <dt className="text-xs text-brand-muted">
                                    Last updated
                                </dt>
                                <dd className="mt-1">
                                    {formatDateTime(record.updatedAt)}
                                </dd>
                            </div>
                        </dl>
                    </article>
                ))}
            </div>

            <div className="mt-5 hidden overflow-x-auto md:block">
                <table className="w-full min-w-190 border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-brand-border text-xs text-brand-muted">
                            <th className="px-3 py-3 font-semibold">PAP</th>
                            <th className="px-3 py-3 font-semibold">
                                Fiscal year
                            </th>
                            <th className="px-3 py-3 font-semibold">
                                Requested amount
                            </th>
                            <th className="px-3 py-3 font-semibold">Status</th>
                            <th className="px-3 py-3 font-semibold">
                                Last updated
                            </th>
                            <th className="px-3 py-3 font-semibold">
                                Next action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => (
                            <tr
                                key={record.id}
                                className="border-b border-brand-border last:border-0"
                            >
                                <td className="max-w-72 px-3 py-4 align-top">
                                    <span className="font-mono text-xs font-semibold text-brand-purple">
                                        {record.reference}
                                    </span>
                                    <p className="mt-1 font-medium break-words text-brand-text">
                                        {record.title}
                                    </p>
                                </td>
                                <td className="px-3 py-4 align-top">
                                    {record.fiscalYear}
                                </td>
                                <td className="px-3 py-4 align-top font-medium whitespace-nowrap">
                                    {record.requestedAmount === null
                                        ? 'Not provided'
                                        : pesoFormatter.format(
                                              record.requestedAmount,
                                          )}
                                </td>
                                <td className="px-3 py-4 align-top">
                                    <StatusBadge status={record.status} />
                                </td>
                                <td className="px-3 py-4 align-top">
                                    {formatDateTime(record.updatedAt)}
                                </td>
                                <td className="px-3 py-4 align-top text-brand-muted">
                                    {record.nextAction ?? 'No action required'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function RecentActivity({ activities }: { activities: ProponentActivity[] }) {
    return (
        <section
            aria-labelledby="activity-heading"
            className="rounded-xl border border-brand-border bg-white p-5 sm:p-6"
        >
            <div className="flex items-start gap-3">
                <History
                    className="mt-0.5 size-5 shrink-0 text-brand-purple"
                    aria-hidden="true"
                />
                <div>
                    <h2
                        id="activity-heading"
                        className="font-semibold text-brand-text"
                    >
                        Recent Activity
                    </h2>
                    <p className="mt-1 text-sm text-brand-muted">
                        Updates involving your authorized PAP records.
                    </p>
                </div>
            </div>

            {activities.length === 0 ? (
                <p className="mt-6 rounded-lg bg-brand-soft p-5 text-sm text-brand-muted">
                    No recent activity is currently available.
                </p>
            ) : (
                <ol className="mt-5 grid gap-5">
                    {activities.map((activity) => (
                        <li key={activity.id} className="flex gap-3">
                            <CircleDot
                                className="mt-1 size-4 shrink-0 text-brand-magenta"
                                aria-hidden="true"
                            />
                            <div className="min-w-0">
                                <p className="text-sm leading-6 text-brand-text">
                                    {activity.description}
                                </p>
                                <p className="mt-1 font-mono text-xs font-semibold text-brand-purple">
                                    {activity.papReference}
                                </p>
                                <p className="mt-1 text-xs text-brand-muted">
                                    <time dateTime={activity.occurredAt}>
                                        {formatDateTime(activity.occurredAt)}
                                    </time>
                                    {activity.actorCategory
                                        ? ` · ${activity.actorCategory}`
                                        : ''}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}

function DashboardUnavailable() {
    return (
        <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-5 py-10">
            <div
                className="w-full rounded-xl border border-brand-border bg-white p-8 text-center"
                role="status"
            >
                <ClipboardList
                    className="mx-auto size-10 text-brand-purple"
                    aria-hidden="true"
                />
                <h1 className="mt-4 text-2xl font-semibold text-brand-text">
                    Dashboard data is not yet available
                </h1>
                <p className="mx-auto mt-3 max-w-xl leading-7 text-brand-muted">
                    The authorized Proponent dashboard service has not been
                    connected. No sample organization records are shown in this
                    environment.
                </p>
            </div>
        </div>
    );
}

export default function Dashboard({
    dashboard: dashboardData,
    previewMode,
}: ProponentDashboardPageProps) {
    const { auth } = usePage().props;
    const data =
        dashboardData ?? (previewMode ? proponentDashboardPreview : null);

    if (!data) {
        return (
            <>
                <Head title="Dashboard" />
                <DashboardUnavailable />
            </>
        );
    }

    return (
        <>
            <Head title="Proponent Dashboard">
                <meta
                    name="description"
                    content="Review authorized PAP submissions, required actions, deadlines, and recent activity."
                />
            </Head>

            <a
                href="#dashboard-content"
                className={`fixed top-3 left-3 z-50 -translate-y-24 rounded-md bg-brand-deep px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0 ${focusClassName}`}
            >
                Skip to dashboard content
            </a>

            <div
                id="dashboard-content"
                className="flex min-w-0 flex-1 flex-col bg-brand-soft/60 px-4 py-6 sm:px-6 lg:px-8"
            >
                <div className="mx-auto w-full max-w-7xl">
                    {previewMode && !dashboardData && (
                        <div
                            className="mb-5 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"
                            role="status"
                        >
                            <AlertTriangle
                                className="mt-0.5 size-4 shrink-0"
                                aria-hidden="true"
                            />
                            <p>
                                <strong>Development preview.</strong> These are
                                clearly labeled demonstration records and are
                                not connected to an organization or backend
                                dashboard service.
                            </p>
                        </div>
                    )}

                    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.12em] text-brand-magenta uppercase">
                                Proponent Workspace
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-text">
                                Good day, {firstName(auth.user.name)}
                            </h1>
                            <p className="mt-2 max-w-2xl leading-7 text-brand-muted">
                                Review your PAP submissions, respond to required
                                actions, and monitor upcoming deadlines.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                disabled
                                title="My PAPs route is not configured"
                            >
                                <FileText aria-hidden="true" />
                                View My PAPs
                            </Button>
                            <Button
                                type="button"
                                disabled
                                title="Create PAP route is not configured"
                                className="bg-brand-purple text-white hover:bg-brand-deep"
                            >
                                <FilePenLine aria-hidden="true" />
                                Create New PAP
                            </Button>
                        </div>
                    </header>

                    <div className="mt-7">
                        <SummaryCards data={data} />
                    </div>

                    <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
                        <ActionRequired actionItems={data.actionItems} />
                        <UpcomingDeadlines deadlines={data.deadlines} />
                    </div>

                    <div className="mt-6">
                        <RecentPaps records={data.recentPaps} />
                    </div>

                    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
                        <div className="rounded-xl border border-dashed border-brand-border bg-white/60 p-6">
                            <SectionHeading
                                title="Notification Preview"
                                description="No notification backend is connected, so notification content is intentionally omitted."
                            />
                        </div>
                        <RecentActivity activities={data.recentActivities} />
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Proponent Workspace',
            href: dashboard(),
        },
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
