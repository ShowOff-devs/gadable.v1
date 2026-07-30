import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarClock,
    CircleCheck,
    LockKeyhole,
    PauseCircle,
    Search,
    ShieldAlert,
    WalletCards,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { index, show } from '@/routes/super-admin/subscriptions';
import { index as plansIndex } from '@/routes/super-admin/subscription-plans';

type Option = { value: string; label: string };
type PlanOption = { id: number; name: string; family: string };
type Subscription = {
    id: number;
    reference: string;
    status: string;
    organization: { name: string; code: string; type: string | null };
    plan: {
        family: string;
        name: string;
        version: number;
        billingCycle: string | null;
    };
    startsOn: string | null;
    endsOn: string | null;
    renewalOn: string | null;
    currency: string;
    agreedRecurringAmount: string | null;
    vatInclusive: boolean | null;
    contractStatus: string | null;
    updatedAt: string | null;
};
type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number | null;
    to: number | null;
    total: number;
};

const statusStyle: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    trial: 'bg-blue-50 text-blue-800 ring-blue-200',
    grace: 'bg-amber-50 text-amber-900 ring-amber-200',
    read_only: 'bg-amber-50 text-amber-900 ring-amber-200',
    suspended: 'bg-red-50 text-red-800 ring-red-200',
    expired: 'bg-red-50 text-red-800 ring-red-200',
    cancelled: 'bg-slate-100 text-slate-700 ring-slate-200',
    terminated: 'bg-red-50 text-red-800 ring-red-200',
};

function label(value: string | null) {
    return value
        ? value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : 'Unavailable';
}

function money(currency: string, value: string | null) {
    if (value === null) {
        return '—';
    }

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(Number(value));
}

export default function SubscriptionsIndex({
    subscriptions,
    filters,
    filterOptions,
    counts,
    timezone,
}: {
    subscriptions: Paginated<Subscription>;
    filters: Record<string, string | undefined>;
    filterOptions: {
        statuses: Option[];
        plans: PlanOption[];
        contractStatuses: string[];
    };
    counts: {
        active: number;
        trial: number;
        expiring: number;
        grace: number;
        readOnly: number;
        suspended: number;
        recurringAnnualValue: string | null;
        recurringAnnualValueAvailable: boolean;
    };
    timezone: string;
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [plan, setPlan] = useState(filters.plan ?? '');
    const [contractStatus, setContractStatus] = useState(
        filters.contract_status ?? '',
    );

    function applyFilters(event: FormEvent) {
        event.preventDefault();
        router.get(
            index().url,
            {
                search: search || undefined,
                status: status || undefined,
                plan: plan || undefined,
                contract_status: contractStatus || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    const cards = [
        ['Active subscriptions', counts.active, CircleCheck],
        ['Trial subscriptions', counts.trial, CalendarClock],
        ['Expiring within 30 days', counts.expiring, AlertTriangle],
        ['In grace period', counts.grace, AlertTriangle],
        ['Read-only organizations', counts.readOnly, LockKeyhole],
        ['Suspended subscriptions', counts.suspended, PauseCircle],
    ] as const;

    return (
        <>
            <Head title="Subscriptions" />
            <div className="mx-auto w-full max-w-[100rem] space-y-6 p-4 sm:p-6 lg:p-8">
                <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-brand-purple">
                            Platform governance
                        </p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight">
                            Subscriptions
                        </h1>
                        <p className="mt-2 max-w-4xl text-sm leading-6 text-brand-muted">
                            Manage versioned plans, organization subscriptions,
                            entitlements, limits, renewals, and lifecycle status
                            without changing tenant records or PAP financial
                            data.
                        </p>
                        <p className="mt-2 text-xs text-brand-muted">
                            Dates use {timezone}.
                        </p>
                    </div>
                    <Link
                        href={plansIndex().url}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-deep px-4 text-sm font-semibold text-white focus-visible:ring-3 focus-visible:ring-brand-purple/30 focus-visible:outline-none"
                    >
                        Manage plans
                    </Link>
                </header>

                <section aria-labelledby="subscription-summary">
                    <h2 id="subscription-summary" className="sr-only">
                        Subscription summary
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {cards.map(([title, value, Icon]) => (
                            <article
                                key={title}
                                className="rounded-xl border border-brand-border bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-brand-muted">
                                            {title}
                                        </p>
                                        <p className="mt-2 text-3xl font-bold">
                                            {value}
                                        </p>
                                    </div>
                                    <Icon
                                        className="size-5 text-brand-purple"
                                        aria-hidden="true"
                                    />
                                </div>
                            </article>
                        ))}
                        <article className="rounded-xl border border-brand-border bg-white p-4 shadow-sm sm:col-span-2">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-brand-muted">
                                        Confirmed annual recurring value
                                    </p>
                                    <p className="mt-2 text-2xl font-bold">
                                        {counts.recurringAnnualValueAvailable
                                            ? counts.recurringAnnualValue
                                            : 'Unavailable'}
                                    </p>
                                    <p className="mt-1 text-xs text-brand-muted">
                                        Not derived from PAP budgets or
                                        onboarding charges.
                                    </p>
                                </div>
                                <WalletCards
                                    className="size-5 text-brand-purple"
                                    aria-hidden="true"
                                />
                            </div>
                        </article>
                    </div>
                </section>

                <form
                    onSubmit={applyFilters}
                    className="rounded-xl border border-brand-border bg-white p-4 shadow-sm"
                >
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_repeat(3,minmax(10rem,0.55fr))_auto_auto] xl:items-end">
                        <label className="grid gap-1.5 text-sm font-semibold">
                            Search
                            <span className="relative">
                                <Search
                                    className="pointer-events-none absolute top-3 left-3 size-4 text-brand-muted"
                                    aria-hidden="true"
                                />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="min-h-11 w-full rounded-lg border border-brand-border pl-9"
                                    placeholder="Organization, code, or reference"
                                />
                            </span>
                        </label>
                        <label className="grid gap-1.5 text-sm font-semibold">
                            Status
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="min-h-11 rounded-lg border border-brand-border bg-white px-3"
                            >
                                <option value="">All statuses</option>
                                {filterOptions.statuses.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="grid gap-1.5 text-sm font-semibold">
                            Plan
                            <select
                                value={plan}
                                onChange={(e) => setPlan(e.target.value)}
                                className="min-h-11 rounded-lg border border-brand-border bg-white px-3"
                            >
                                <option value="">All plans</option>
                                {filterOptions.plans.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="grid gap-1.5 text-sm font-semibold">
                            Contract status
                            <select
                                value={contractStatus}
                                onChange={(e) =>
                                    setContractStatus(e.target.value)
                                }
                                className="min-h-11 rounded-lg border border-brand-border bg-white px-3"
                            >
                                <option value="">All contract states</option>
                                {filterOptions.contractStatuses.map(
                                    (option) => (
                                        <option key={option} value={option}>
                                            {label(option)}
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>
                        <button className="min-h-11 rounded-lg bg-brand-purple px-4 text-sm font-semibold text-white">
                            Apply
                        </button>
                        <Link
                            href={index().url}
                            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-border px-4 text-sm font-semibold"
                        >
                            Clear filters
                        </Link>
                    </div>
                </form>

                <section
                    className="overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm"
                    aria-labelledby="registry-heading"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border px-4 py-3">
                        <h2 id="registry-heading" className="font-bold">
                            Subscription registry
                        </h2>
                        <p className="text-sm text-brand-muted">
                            {subscriptions.total === 0
                                ? 'No records'
                                : `${subscriptions.from}–${subscriptions.to} of ${subscriptions.total}`}
                        </p>
                    </div>
                    {subscriptions.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <ShieldAlert
                                className="mx-auto size-8 text-brand-muted"
                                aria-hidden="true"
                            />
                            <h3 className="mt-3 font-semibold">
                                No subscriptions found
                            </h3>
                            <p className="mt-1 text-sm text-brand-muted">
                                No authoritative subscription matches the
                                current filters.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-[70rem] text-left text-sm">
                                    <thead className="bg-brand-soft text-xs tracking-wide text-brand-muted uppercase">
                                        <tr>
                                            <th className="px-4 py-3">
                                                Organization
                                            </th>
                                            <th className="px-4 py-3">
                                                Plan and version
                                            </th>
                                            <th className="px-4 py-3">
                                                Status
                                            </th>
                                            <th className="px-4 py-3">Term</th>
                                            <th className="px-4 py-3">
                                                Agreed recurring
                                            </th>
                                            <th className="px-4 py-3">
                                                Contract
                                            </th>
                                            <th className="px-4 py-3">
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border">
                                        {subscriptions.data.map(
                                            (subscription) => (
                                                <tr key={subscription.id}>
                                                    <td className="px-4 py-4">
                                                        <p className="font-semibold">
                                                            {
                                                                subscription
                                                                    .organization
                                                                    .name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-brand-muted">
                                                            {
                                                                subscription
                                                                    .organization
                                                                    .code
                                                            }{' '}
                                                            ·{' '}
                                                            {
                                                                subscription.reference
                                                            }
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="font-semibold">
                                                            {
                                                                subscription
                                                                    .plan.name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-brand-muted">
                                                            {
                                                                subscription
                                                                    .plan.family
                                                            }{' '}
                                                            · Version{' '}
                                                            {
                                                                subscription
                                                                    .plan
                                                                    .version
                                                            }
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyle[subscription.status] ?? 'bg-slate-100 text-slate-700 ring-slate-200'}`}
                                                        >
                                                            {label(
                                                                subscription.status,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p>
                                                            {subscription.startsOn ??
                                                                'Unavailable'}{' '}
                                                            –{' '}
                                                            {subscription.endsOn ??
                                                                'Unavailable'}
                                                        </p>
                                                        <p className="text-xs text-brand-muted">
                                                            Renewal:{' '}
                                                            {subscription.renewalOn ??
                                                                'Unavailable'}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="font-semibold">
                                                            {money(
                                                                subscription.currency,
                                                                subscription.agreedRecurringAmount,
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-brand-muted">
                                                            {subscription.vatInclusive ===
                                                            null
                                                                ? 'VAT treatment unavailable'
                                                                : subscription.vatInclusive
                                                                  ? 'VAT inclusive'
                                                                  : 'VAT exclusive'}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {label(
                                                            subscription.contractStatus,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <Link
                                                            href={
                                                                show(
                                                                    subscription.id,
                                                                ).url
                                                            }
                                                            className="font-semibold text-brand-purple underline-offset-4 hover:underline"
                                                        >
                                                            View details
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="grid gap-3 p-3 lg:hidden">
                                {subscriptions.data.map((subscription) => (
                                    <article
                                        key={subscription.id}
                                        className="rounded-lg border border-brand-border p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="font-bold">
                                                    {
                                                        subscription
                                                            .organization.name
                                                    }
                                                </h3>
                                                <p className="text-xs text-brand-muted">
                                                    {
                                                        subscription
                                                            .organization.code
                                                    }{' '}
                                                    · {subscription.reference}
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ring-1 ${statusStyle[subscription.status] ?? 'bg-slate-100 text-slate-700 ring-slate-200'}`}
                                            >
                                                {label(subscription.status)}
                                            </span>
                                        </div>
                                        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <dt className="text-brand-muted">
                                                    Plan
                                                </dt>
                                                <dd className="font-semibold">
                                                    {subscription.plan.name} v
                                                    {subscription.plan.version}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-brand-muted">
                                                    Expiry
                                                </dt>
                                                <dd className="font-semibold">
                                                    {subscription.endsOn ??
                                                        'Unavailable'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-brand-muted">
                                                    Agreed recurring
                                                </dt>
                                                <dd className="font-semibold">
                                                    {money(
                                                        subscription.currency,
                                                        subscription.agreedRecurringAmount,
                                                    )}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-brand-muted">
                                                    Contract
                                                </dt>
                                                <dd className="font-semibold">
                                                    {label(
                                                        subscription.contractStatus,
                                                    )}
                                                </dd>
                                            </div>
                                        </dl>
                                        <Link
                                            href={show(subscription.id).url}
                                            className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand-purple"
                                        >
                                            View subscription
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                </section>
                <nav
                    aria-label="Subscription pagination"
                    className="flex flex-wrap gap-2"
                >
                    {subscriptions.links.map((link, position) =>
                        link.url ? (
                            <Link
                                key={position}
                                href={link.url}
                                preserveScroll
                                className={`rounded-md border px-3 py-2 text-sm ${link.active ? 'bg-brand-deep text-white' : 'bg-white'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={position}
                                className="rounded-md border px-3 py-2 text-sm opacity-40"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ),
                    )}
                </nav>
            </div>
        </>
    );
}
