import { Head, Link, router } from '@inertiajs/react';
import { LockKeyhole, PackageOpen, Plus, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { index as subscriptionsIndex } from '@/routes/super-admin/subscriptions';
import { create, index, show } from '@/routes/super-admin/subscription-plans';

type Version = {
    id: number;
    number: number;
    status: string;
    currency: string;
    recurringAmount: string | null;
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
    active: boolean;
    updatedAt: string | null;
    versions: Version[];
};
type Page = {
    data: Plan[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};
type Option = { value: string; label: string };

function amount(currency: string, value: string | null) {
    return value === null
        ? '—'
        : new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency,
          }).format(Number(value));
}

export default function SubscriptionPlans({
    plans,
    filters,
    filterOptions,
}: {
    plans: Page;
    filters: Record<string, string | undefined>;
    filterOptions: {
        families: string[];
        statuses: Option[];
        billingCycles: string[];
    };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [family, setFamily] = useState(filters.family ?? '');
    const [billingCycle, setBillingCycle] = useState(
        filters.billing_cycle ?? '',
    );

    function filter(event: FormEvent) {
        event.preventDefault();
        router.get(
            index().url,
            {
                search: search || undefined,
                status: status || undefined,
                family: family || undefined,
                billing_cycle: billingCycle || undefined,
            },
            { preserveState: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Subscription Plans" />
            <div className="mx-auto w-full max-w-[90rem] space-y-6 p-4 sm:p-6 lg:p-8">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-brand-purple">
                            Subscriptions
                        </p>
                        <h1 className="mt-1 text-3xl font-bold">
                            Versioned plans
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm text-brand-muted">
                            Create draft plans, validate their configuration,
                            and publish immutable commercial and entitlement
                            snapshots.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={subscriptionsIndex().url}
                            className="inline-flex min-h-11 items-center rounded-lg border border-brand-border bg-white px-4 text-sm font-semibold"
                        >
                            Back to subscriptions
                        </Link>
                        <Link
                            href={create().url}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-deep px-4 text-sm font-semibold text-white"
                        >
                            <Plus className="size-4" />
                            Create plan
                        </Link>
                    </div>
                </header>
                <form
                    onSubmit={filter}
                    className="grid gap-3 rounded-xl border border-brand-border bg-white p-4 md:grid-cols-2 xl:grid-cols-[1fr_repeat(3,0.65fr)_auto_auto] xl:items-end"
                >
                    <label className="grid gap-1 text-sm font-semibold">
                        Search
                        <span className="relative">
                            <Search className="absolute top-3 left-3 size-4 text-brand-muted" />
                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                className="min-h-11 w-full rounded-lg border border-brand-border pl-9"
                                placeholder="Plan name or code"
                            />
                        </span>
                    </label>
                    <label className="grid gap-1 text-sm font-semibold">
                        Status
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="min-h-11 rounded-lg border border-brand-border bg-white px-3"
                        >
                            <option value="">All statuses</option>
                            {filterOptions.statuses.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="grid gap-1 text-sm font-semibold">
                        Family
                        <select
                            value={family}
                            onChange={(event) => setFamily(event.target.value)}
                            className="min-h-11 rounded-lg border border-brand-border bg-white px-3"
                        >
                            <option value="">All families</option>
                            {filterOptions.families.map((option) => (
                                <option key={option}>{option}</option>
                            ))}
                        </select>
                    </label>
                    <label className="grid gap-1 text-sm font-semibold">
                        Billing cycle
                        <select
                            value={billingCycle}
                            onChange={(event) =>
                                setBillingCycle(event.target.value)
                            }
                            className="min-h-11 rounded-lg border border-brand-border bg-white px-3"
                        >
                            <option value="">All cycles</option>
                            {filterOptions.billingCycles.map((option) => (
                                <option key={option}>{option}</option>
                            ))}
                        </select>
                    </label>
                    <button className="min-h-11 rounded-lg bg-brand-purple px-4 font-semibold text-white">
                        Apply
                    </button>
                    <Link
                        href={index().url}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-border px-4 font-semibold"
                    >
                        Clear
                    </Link>
                </form>
                {plans.data.length === 0 ? (
                    <div className="rounded-xl border border-brand-border bg-white p-12 text-center">
                        <PackageOpen className="mx-auto size-9 text-brand-muted" />
                        <h2 className="mt-3 font-bold">No plans configured</h2>
                        <p className="mt-1 text-sm text-brand-muted">
                            Create an authoritative draft. It will not be
                            published automatically.
                        </p>
                        <Link
                            href={create().url}
                            className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-brand-deep px-4 font-semibold text-white"
                        >
                            Create your first plan
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {plans.data.map((plan) => {
                            const latest = plan.versions[0];

                            return (
                                <article
                                    key={plan.id}
                                    className="rounded-xl border border-brand-border bg-white p-5 shadow-sm"
                                >
                                    <p className="text-xs font-bold tracking-wide text-brand-purple uppercase">
                                        {plan.family}
                                    </p>
                                    <h2 className="mt-1 text-xl font-bold">
                                        {plan.name}
                                    </h2>
                                    <p className="text-sm text-brand-muted">
                                        {plan.code}
                                    </p>
                                    {latest ? (
                                        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <dt className="text-brand-muted">
                                                    Latest version
                                                </dt>
                                                <dd className="font-semibold">
                                                    Version {latest.number}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-brand-muted">
                                                    Status
                                                </dt>
                                                <dd className="flex items-center gap-1 font-semibold">
                                                    {latest.immutable && (
                                                        <LockKeyhole className="size-3" />
                                                    )}
                                                    {latest.status.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-brand-muted">
                                                    Recurring
                                                </dt>
                                                <dd className="font-semibold">
                                                    {amount(
                                                        latest.currency,
                                                        latest.recurringAmount,
                                                    )}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-brand-muted">
                                                    Organizations
                                                </dt>
                                                <dd className="font-semibold">
                                                    {latest.subscriptionsCount}
                                                </dd>
                                            </div>
                                        </dl>
                                    ) : (
                                        <p className="mt-4 text-sm text-brand-muted">
                                            No versions configured.
                                        </p>
                                    )}
                                    <Link
                                        href={show(plan.id).url}
                                        className="mt-5 inline-flex min-h-11 items-center font-semibold text-brand-purple"
                                    >
                                        Manage plan →
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                )}
                <nav
                    aria-label="Plan pagination"
                    className="flex flex-wrap gap-2"
                >
                    {plans.links.map((link, indexPosition) =>
                        link.url ? (
                            <Link
                                key={indexPosition}
                                href={link.url}
                                className={`rounded-md border px-3 py-2 text-sm ${link.active ? 'bg-brand-deep text-white' : 'bg-white'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={indexPosition}
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
