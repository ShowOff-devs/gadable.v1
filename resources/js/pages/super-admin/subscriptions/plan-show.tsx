import { Head, Link } from '@inertiajs/react';
import { Clock3, LockKeyhole } from 'lucide-react';
import { index } from '@/routes/super-admin/subscription-plans';
import { show as versionShow } from '@/routes/super-admin/subscription-plan-versions';

type Version = {
    id: number;
    number: number;
    status: string;
    recurringAmount: string | null;
    currency: string;
    billingCycle: string | null;
    effectiveFrom: string | null;
    subscriptionsCount: number;
    immutable: boolean;
};
type Plan = {
    id: number;
    family: string;
    name: string;
    code: string;
    description: string | null;
    versions: Version[];
};
type Event = {
    id: number;
    action: string;
    outcome: string;
    previousStatus: string | null;
    newStatus: string | null;
    reason: string | null;
    reference: string;
    createdAt: string | null;
};

export default function PlanShow({
    plan,
    events,
}: {
    plan: Plan;
    events: Event[];
}) {
    return (
        <>
            <Head title={plan.name} />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                <header>
                    <Link
                        href={index().url}
                        className="text-sm font-semibold text-brand-purple"
                    >
                        ← Versioned plans
                    </Link>
                    <p className="mt-4 text-sm font-semibold text-brand-purple">
                        {plan.family}
                    </p>
                    <h1 className="text-3xl font-bold">{plan.name}</h1>
                    <p className="text-sm text-brand-muted">{plan.code}</p>
                    {plan.description && (
                        <p className="mt-3 max-w-3xl text-sm text-brand-muted">
                            {plan.description}
                        </p>
                    )}
                </header>
                <section className="rounded-xl border border-brand-border bg-white shadow-sm">
                    <div className="border-b border-brand-border p-5">
                        <h2 className="text-xl font-bold">Plan versions</h2>
                        <p className="mt-1 text-sm text-brand-muted">
                            Organizations stay attached to the exact published
                            version they were assigned.
                        </p>
                    </div>
                    <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                        {plan.versions.map((version) => (
                            <article
                                key={version.id}
                                className="rounded-lg border border-brand-border p-4"
                            >
                                <div className="flex justify-between gap-2">
                                    <h3 className="font-bold">
                                        Version {version.number}
                                    </h3>
                                    <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-xs font-bold">
                                        {version.immutable && (
                                            <LockKeyhole className="size-3" />
                                        )}
                                        {version.status}
                                    </span>
                                </div>
                                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <dt className="text-brand-muted">
                                            Recurring
                                        </dt>
                                        <dd className="font-semibold">
                                            {version.recurringAmount === null
                                                ? 'Unavailable'
                                                : `${version.currency} ${version.recurringAmount}`}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-brand-muted">
                                            Assignments
                                        </dt>
                                        <dd className="font-semibold">
                                            {version.subscriptionsCount}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-brand-muted">
                                            Effective
                                        </dt>
                                        <dd className="font-semibold">
                                            {version.effectiveFrom ??
                                                'Unavailable'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-brand-muted">
                                            Cycle
                                        </dt>
                                        <dd className="font-semibold">
                                            {version.billingCycle ??
                                                'Unavailable'}
                                        </dd>
                                    </div>
                                </dl>
                                <Link
                                    href={
                                        versionShow([plan.id, version.id]).url
                                    }
                                    className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand-purple"
                                >
                                    Open version →
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
                <section className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
                    <h2 className="flex items-center gap-2 text-xl font-bold">
                        <Clock3 className="size-5 text-brand-purple" />
                        Lifecycle history
                    </h2>
                    {events.length === 0 ? (
                        <p className="mt-3 text-sm text-brand-muted">
                            No lifecycle events recorded.
                        </p>
                    ) : (
                        <ol className="mt-4 grid gap-3">
                            {events.map((event) => (
                                <li
                                    key={event.id}
                                    className="rounded-lg border border-brand-border p-3"
                                >
                                    <div className="flex flex-wrap justify-between gap-2">
                                        <p className="font-semibold">
                                            {event.action
                                                .replaceAll('_', ' ')
                                                .replaceAll('.', ' · ')}
                                        </p>
                                        <time className="text-xs text-brand-muted">
                                            {event.createdAt ?? 'Unavailable'}
                                        </time>
                                    </div>
                                    <p className="mt-1 text-sm text-brand-muted">
                                        {event.previousStatus ?? '—'} →{' '}
                                        {event.newStatus ?? '—'} ·{' '}
                                        {event.outcome}
                                    </p>
                                    {event.reason && (
                                        <p className="mt-1 text-sm">
                                            {event.reason}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ol>
                    )}
                </section>
            </div>
        </>
    );
}
