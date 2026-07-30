import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    FileText,
    Gauge,
    LockKeyhole,
} from 'lucide-react';
import { index } from '@/routes/super-admin/subscriptions';

type SubscriptionDetail = {
    reference: string;
    status: string;
    organization: { name: string; code: string; type: string | null };
    organizationStatus: string;
    plan: {
        family: string;
        name: string;
        version: number;
        billingCycle: string | null;
    };
    planVersionStatus: string;
    startsOn: string | null;
    endsOn: string | null;
    renewalOn: string | null;
    graceEndsOn: string | null;
    currency: string;
    standardImplementationAmount: string | null;
    standardRecurringAmount: string | null;
    agreedImplementationAmount: string | null;
    agreedRecurringAmount: string | null;
    vatInclusive: boolean | null;
    entitlements: Record<string, { limit?: number | null; unit?: string }>;
    entitlementOverrides: Record<
        string,
        { limit?: number | null; unit?: string }
    > | null;
    contractStatus: string | null;
    contractReference: string | null;
    purchaseOrderReference: string | null;
    invoiceReference: string | null;
    paymentConfirmationReference: string | null;
};

function label(value: string | null) {
    return value
        ? value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : 'Unavailable';
}

function money(currency: string, value: string | null) {
    return value === null
        ? '—'
        : new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency,
          }).format(Number(value));
}

export default function SubscriptionShow({
    subscription,
    timezone,
}: {
    subscription: SubscriptionDetail;
    timezone: string;
}) {
    const effectiveEntitlements = {
        ...subscription.entitlements,
        ...(subscription.entitlementOverrides ?? {}),
    };

    return (
        <>
            <Head title={`Subscription ${subscription.reference}`} />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                <header>
                    <Link
                        href={index().url}
                        className="text-sm font-semibold text-brand-purple"
                    >
                        ← Subscription registry
                    </Link>
                    <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-brand-muted">
                                {subscription.reference}
                            </p>
                            <h1 className="text-3xl font-bold">
                                {subscription.organization.name}
                            </h1>
                            <p className="mt-1 text-sm text-brand-muted">
                                {subscription.organization.code} ·{' '}
                                {subscription.plan.name} version{' '}
                                {subscription.plan.version}
                            </p>
                        </div>
                        <span className="rounded-full bg-brand-soft px-3 py-1.5 text-sm font-bold">
                            {label(subscription.status)}
                        </span>
                    </div>
                    <p className="mt-3 text-xs text-brand-muted">
                        Dates use {timezone}.
                    </p>
                </header>

                {['read_only', 'suspended', 'expired', 'terminated'].includes(
                    subscription.status,
                ) && (
                    <div
                        role="status"
                        className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950"
                    >
                        <AlertTriangle
                            className="mt-0.5 size-5 shrink-0"
                            aria-hidden="true"
                        />
                        <div>
                            <p className="font-bold">
                                {label(subscription.status)} subscription
                            </p>
                            <p className="text-sm">
                                Restricted writes must be enforced by the
                                backend. Tenant records and audit history remain
                                preserved.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                    <section className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 text-lg font-bold">
                            <Building2
                                className="size-5 text-brand-purple"
                                aria-hidden="true"
                            />
                            Overview
                        </h2>
                        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-brand-muted">
                                    Organization status
                                </dt>
                                <dd className="font-semibold">
                                    {label(subscription.organizationStatus)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">
                                    Plan family
                                </dt>
                                <dd className="font-semibold">
                                    {subscription.plan.family}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">Term</dt>
                                <dd className="font-semibold">
                                    {subscription.startsOn ?? 'Unavailable'} –{' '}
                                    {subscription.endsOn ?? 'Unavailable'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">
                                    Renewal date
                                </dt>
                                <dd className="font-semibold">
                                    {subscription.renewalOn ?? 'Unavailable'}
                                </dd>
                            </div>
                        </dl>
                    </section>
                    <section className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 text-lg font-bold">
                            <LockKeyhole
                                className="size-5 text-brand-purple"
                                aria-hidden="true"
                            />
                            Plan and agreement price
                        </h2>
                        <p className="mt-2 text-xs text-brand-muted">
                            Standard plan references and organization-agreed
                            amounts remain distinct.
                        </p>
                        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-brand-muted">
                                    Standard implementation
                                </dt>
                                <dd className="font-semibold">
                                    {money(
                                        subscription.currency,
                                        subscription.standardImplementationAmount,
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">
                                    Agreed implementation
                                </dt>
                                <dd className="font-semibold">
                                    {money(
                                        subscription.currency,
                                        subscription.agreedImplementationAmount,
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">
                                    Standard recurring
                                </dt>
                                <dd className="font-semibold">
                                    {money(
                                        subscription.currency,
                                        subscription.standardRecurringAmount,
                                    )}
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
                                    VAT treatment
                                </dt>
                                <dd className="font-semibold">
                                    {subscription.vatInclusive === null
                                        ? 'Unavailable'
                                        : subscription.vatInclusive
                                          ? 'VAT inclusive'
                                          : 'VAT exclusive'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">
                                    Plan version
                                </dt>
                                <dd className="font-semibold">
                                    Version {subscription.plan.version} ·{' '}
                                    {label(subscription.planVersionStatus)}
                                </dd>
                            </div>
                        </dl>
                    </section>
                    <section className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 text-lg font-bold">
                            <Gauge
                                className="size-5 text-brand-purple"
                                aria-hidden="true"
                            />
                            Effective entitlements
                        </h2>
                        {Object.keys(effectiveEntitlements).length === 0 ? (
                            <p className="mt-3 text-sm text-brand-muted">
                                No entitlement data is available.
                            </p>
                        ) : (
                            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                                {Object.entries(effectiveEntitlements).map(
                                    ([key, value]) => (
                                        <div
                                            key={key}
                                            className="rounded-lg bg-brand-soft p-3"
                                        >
                                            <dt className="text-sm text-brand-muted">
                                                {label(key)}
                                            </dt>
                                            <dd className="font-bold">
                                                {value.limit === null
                                                    ? 'Unlimited'
                                                    : value.limit === undefined
                                                      ? 'Unavailable'
                                                      : `${value.limit.toLocaleString()} ${value.unit ?? ''}`}
                                            </dd>
                                        </div>
                                    ),
                                )}
                            </dl>
                        )}
                        <p className="mt-4 text-xs text-brand-muted">
                            Usage counters are unavailable until authoritative
                            metering services are connected.
                        </p>
                    </section>
                    <section className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 text-lg font-bold">
                            <FileText
                                className="size-5 text-brand-purple"
                                aria-hidden="true"
                            />
                            Commercial references
                        </h2>
                        <p className="mt-2 text-xs text-brand-muted">
                            Reference metadata only. GADable does not process
                            payments or maintain an accounting ledger.
                        </p>
                        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-brand-muted">
                                    Contract status
                                </dt>
                                <dd className="font-semibold">
                                    {label(subscription.contractStatus)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">Contract</dt>
                                <dd className="font-semibold">
                                    {subscription.contractReference ??
                                        'Unavailable'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">
                                    Purchase order
                                </dt>
                                <dd className="font-semibold">
                                    {subscription.purchaseOrderReference ??
                                        'Unavailable'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">Invoice</dt>
                                <dd className="font-semibold">
                                    {subscription.invoiceReference ??
                                        'Unavailable'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">
                                    Payment confirmation
                                </dt>
                                <dd className="font-semibold">
                                    {subscription.paymentConfirmationReference ??
                                        'Unavailable'}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>
            </div>
        </>
    );
}
