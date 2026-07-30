import { Head, Link, useForm } from '@inertiajs/react';
import { Check, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import {
    index as plansIndex,
    store,
} from '@/routes/super-admin/subscription-plans';
import {
    show as versionShow,
    update,
} from '@/routes/super-admin/subscription-plan-versions';

type LimitConfig = {
    state: string;
    value: number | null;
    unit: string;
    period: string;
};
type EntitlementConfig = { state: string; limit: number | null };
type SupportConfig = {
    tier: string;
    training_sessions: number;
    administrator_orientation: boolean;
    system_health_review: boolean;
    hosting_included: boolean;
    backups_included: boolean;
    maintenance_included: boolean;
    product_updates: boolean;
    email_support: boolean;
    priority_support: boolean;
};
type PlanFormData = {
    family: string;
    name: string;
    code: string;
    description: string;
    intended_customer_type: string;
    deployment_scope: string;
    version_number: number;
    billing_cycle: string;
    currency: string;
    implementation_amount: string;
    recurring_amount: string;
    renewal_amount: string;
    vat_rate: string;
    vat_inclusive: boolean;
    grace_period_days: number;
    price_valid_until: string;
    effective_from: string;
    effective_until: string;
    commercial_notes: string;
    change_summary: string;
    limits: Record<string, LimitConfig>;
    entitlements: Record<string, EntitlementConfig>;
    support_configuration: SupportConfig;
    lock_version: number;
};
type ExistingVersion = Partial<PlanFormData> & {
    id: number;
    status: string;
    lock_version: number;
};

const steps = [
    'Basic information',
    'Pricing',
    'Limits',
    'Entitlements',
    'Support',
    'Review',
];
const inputClass =
    'min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 focus-visible:ring-3 focus-visible:ring-brand-purple/20 focus-visible:outline-none';

export default function PlanForm({
    plan,
    version,
    limitDefinitions,
    entitlementDefinitions,
    billingCycles,
    supportTiers,
}: {
    plan: { id: number; name: string; code: string; family: string } | null;
    version: ExistingVersion | null;
    limitDefinitions: Record<string, string>;
    entitlementDefinitions: Record<string, string>;
    billingCycles: string[];
    supportTiers: string[];
}) {
    const [step, setStep] = useState(0);
    const defaultLimits = useMemo(
        () =>
            Object.fromEntries(
                Object.keys(limitDefinitions).map((key) => [
                    key,
                    {
                        state: 'unavailable',
                        value: null,
                        unit: key === 'storage_bytes' ? 'bytes' : 'count',
                        period: 'annual',
                    },
                ]),
            ),
        [limitDefinitions],
    );
    const defaultEntitlements = useMemo(
        () =>
            Object.fromEntries(
                Object.keys(entitlementDefinitions).map((key) => [
                    key,
                    { state: 'excluded', limit: null },
                ]),
            ),
        [entitlementDefinitions],
    );
    const { data, setData, post, put, processing, errors } =
        useForm<PlanFormData>({
            family: plan?.family ?? 'Agency and Institution',
            name: plan?.name ?? '',
            code: plan?.code ?? '',
            description: '',
            intended_customer_type: '',
            deployment_scope: '',
            version_number: version?.version_number ?? 1,
            billing_cycle: version?.billing_cycle ?? 'annual',
            currency: version?.currency ?? 'PHP',
            implementation_amount: version?.implementation_amount ?? '',
            recurring_amount: version?.recurring_amount ?? '',
            renewal_amount: version?.renewal_amount ?? '',
            vat_rate: version?.vat_rate ?? '12.00',
            vat_inclusive: version?.vat_inclusive ?? true,
            grace_period_days: version?.grace_period_days ?? 0,
            price_valid_until: version?.price_valid_until ?? '',
            effective_from: version?.effective_from ?? '',
            effective_until: version?.effective_until ?? '',
            commercial_notes: version?.commercial_notes ?? '',
            change_summary: version?.change_summary ?? '',
            limits: version?.limits ?? defaultLimits,
            entitlements: version?.entitlements ?? defaultEntitlements,
            support_configuration: version?.support_configuration ?? {
                tier: 'standard',
                training_sessions: 0,
                administrator_orientation: false,
                system_health_review: false,
                hosting_included: true,
                backups_included: true,
                maintenance_included: true,
                product_updates: true,
                email_support: true,
                priority_support: false,
            },
            lock_version: version?.lock_version ?? 1,
        });
    const editing = plan !== null && version !== null;

    function submit(event: FormEvent) {
        event.preventDefault();

        if (editing) {
            put(update([plan.id, version.id]).url);
        } else {
            post(store().url);
        }
    }
    function error(name: string) {
        const message = errors[name as keyof typeof errors];

        return message ? (
            <p className="text-sm font-medium text-red-700">
                {String(message)}
            </p>
        ) : null;
    }

    return (
        <>
            <Head
                title={
                    editing
                        ? `Edit ${plan.name} version ${version.version_number}`
                        : 'Create Subscription Plan'
                }
            />
            <form
                onSubmit={submit}
                className="mx-auto w-full max-w-6xl space-y-6 p-4 pb-28 sm:p-6 lg:p-8"
            >
                <header>
                    <Link
                        href={
                            editing
                                ? versionShow([plan.id, version.id]).url
                                : plansIndex().url
                        }
                        className="text-sm font-semibold text-brand-purple"
                    >
                        ← Cancel and return
                    </Link>
                    <h1 className="mt-3 text-3xl font-bold">
                        {editing
                            ? 'Configure draft version'
                            : 'Create subscription plan'}
                    </h1>
                    <p className="mt-2 text-sm text-brand-muted">
                        Standard prices remain indicative until confirmed in an
                        organization agreement. Saving never publishes
                        automatically.
                    </p>
                </header>
                {Object.keys(errors).length > 0 && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-300 bg-red-50 p-4"
                    >
                        <p className="font-bold text-red-900">
                            Review the highlighted configuration errors.
                        </p>
                        <ul className="mt-2 list-disc pl-5 text-sm text-red-800">
                            {Object.entries(errors)
                                .slice(0, 8)
                                .map(([key, message]) => (
                                    <li key={key}>{String(message)}</li>
                                ))}
                        </ul>
                    </div>
                )}
                <ol
                    className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
                    aria-label="Plan creation steps"
                >
                    {steps.map((title, position) => (
                        <li key={title}>
                            <button
                                type="button"
                                onClick={() => setStep(position)}
                                aria-current={
                                    step === position ? 'step' : undefined
                                }
                                className={`min-h-11 w-full rounded-lg px-2 text-xs font-bold ${step === position ? 'bg-brand-deep text-white' : position < step ? 'bg-emerald-50 text-emerald-800' : 'bg-white text-brand-muted'}`}
                            >
                                {position < step && (
                                    <Check className="mr-1 inline size-3" />
                                )}
                                {position + 1}. {title}
                            </button>
                        </li>
                    ))}
                </ol>

                <section className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-bold">{steps[step]}</h2>
                    {step === 0 && (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <Field label="Plan family" error={error('family')}>
                                <input
                                    disabled={editing}
                                    value={data.family}
                                    onChange={(e) =>
                                        setData('family', e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Plan name" error={error('name')}>
                                <input
                                    disabled={editing}
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field
                                label="Stable plan code"
                                help="Uppercase letters, numbers, and hyphens only."
                                error={error('code')}
                            >
                                <input
                                    disabled={editing}
                                    value={data.code}
                                    onChange={(e) =>
                                        setData(
                                            'code',
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    className={inputClass}
                                    placeholder="AGENCY-PROFESSIONAL"
                                />
                            </Field>
                            <Field label="Initial version">
                                <input
                                    disabled={editing}
                                    type="number"
                                    min="1"
                                    value={data.version_number}
                                    onChange={(e) =>
                                        setData(
                                            'version_number',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Intended customer type">
                                <input
                                    disabled={editing}
                                    value={data.intended_customer_type}
                                    onChange={(e) =>
                                        setData(
                                            'intended_customer_type',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Deployment scope">
                                <input
                                    disabled={editing}
                                    value={data.deployment_scope}
                                    onChange={(e) =>
                                        setData(
                                            'deployment_scope',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field
                                label="Effective date"
                                error={error('effective_from')}
                            >
                                <input
                                    type="date"
                                    value={data.effective_from}
                                    onChange={(e) =>
                                        setData(
                                            'effective_from',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Optional retirement date">
                                <input
                                    type="date"
                                    value={data.effective_until}
                                    onChange={(e) =>
                                        setData(
                                            'effective_until',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            {!editing && (
                                <Field label="Description">
                                    <textarea
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        className={`${inputClass} min-h-24 py-2`}
                                    />
                                </Field>
                            )}
                            <Field
                                label="Change summary"
                                error={error('change_summary')}
                            >
                                <textarea
                                    value={data.change_summary}
                                    onChange={(e) =>
                                        setData(
                                            'change_summary',
                                            e.target.value,
                                        )
                                    }
                                    className={`${inputClass} min-h-24 py-2`}
                                />
                            </Field>
                        </div>
                    )}
                    {step === 1 && (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <Field label="Billing cycle">
                                <select
                                    value={data.billing_cycle}
                                    onChange={(e) =>
                                        setData('billing_cycle', e.target.value)
                                    }
                                    className={inputClass}
                                >
                                    {billingCycles.map((cycle) => (
                                        <option key={cycle}>{cycle}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Currency">
                                <input
                                    value={data.currency}
                                    disabled
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Implementation / onboarding fee">
                                <input
                                    inputMode="decimal"
                                    value={data.implementation_amount}
                                    onChange={(e) =>
                                        setData(
                                            'implementation_amount',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Recurring subscription price">
                                <input
                                    inputMode="decimal"
                                    value={data.recurring_amount}
                                    onChange={(e) =>
                                        setData(
                                            'recurring_amount',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Suggested renewal price">
                                <input
                                    inputMode="decimal"
                                    value={data.renewal_amount}
                                    onChange={(e) =>
                                        setData(
                                            'renewal_amount',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="VAT rate (%)">
                                <input
                                    inputMode="decimal"
                                    value={data.vat_rate}
                                    onChange={(e) =>
                                        setData('vat_rate', e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="VAT treatment">
                                <select
                                    value={
                                        data.vat_inclusive
                                            ? 'inclusive'
                                            : 'exclusive'
                                    }
                                    onChange={(e) =>
                                        setData(
                                            'vat_inclusive',
                                            e.target.value === 'inclusive',
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="inclusive">
                                        VAT inclusive
                                    </option>
                                    <option value="exclusive">
                                        VAT exclusive
                                    </option>
                                </select>
                            </Field>
                            <Field label="Default grace-period days">
                                <input
                                    type="number"
                                    min="0"
                                    value={data.grace_period_days}
                                    onChange={(e) =>
                                        setData(
                                            'grace_period_days',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Price valid until">
                                <input
                                    type="date"
                                    value={data.price_valid_until}
                                    onChange={(e) =>
                                        setData(
                                            'price_valid_until',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Commercial notes">
                                <textarea
                                    value={data.commercial_notes}
                                    onChange={(e) =>
                                        setData(
                                            'commercial_notes',
                                            e.target.value,
                                        )
                                    }
                                    className={`${inputClass} min-h-24 py-2`}
                                />
                            </Field>
                            <div className="rounded-lg bg-brand-soft p-4 md:col-span-2">
                                <p className="font-bold">
                                    Indicative pricing summary
                                </p>
                                <p className="mt-2 text-sm">
                                    First-year total: PHP{' '}
                                    {(
                                        Number(
                                            data.implementation_amount || 0,
                                        ) + Number(data.recurring_amount || 0)
                                    ).toLocaleString('en-PH', {
                                        minimumFractionDigits: 2,
                                    })}
                                </p>
                                <p className="text-sm">
                                    Monthly equivalent: PHP{' '}
                                    {(
                                        Number(data.recurring_amount || 0) / 12
                                    ).toLocaleString('en-PH', {
                                        minimumFractionDigits: 2,
                                    })}
                                </p>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                            {Object.entries(limitDefinitions).map(
                                ([key, label]) => {
                                    const value = data.limits[key];

                                    return (
                                        <div
                                            key={key}
                                            className="rounded-lg border border-brand-border p-4"
                                        >
                                            <p className="font-semibold">
                                                {label}
                                            </p>
                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                                <select
                                                    value={value.state}
                                                    onChange={(e) =>
                                                        setData('limits', {
                                                            ...data.limits,
                                                            [key]: {
                                                                ...value,
                                                                state: e.target
                                                                    .value,
                                                            },
                                                        })
                                                    }
                                                    className={inputClass}
                                                >
                                                    <option value="limited">
                                                        Limited
                                                    </option>
                                                    <option value="unlimited">
                                                        Unlimited
                                                    </option>
                                                    <option value="not_included">
                                                        Not included
                                                    </option>
                                                    <option value="custom">
                                                        Custom
                                                    </option>
                                                    <option value="unavailable">
                                                        Unavailable
                                                    </option>
                                                </select>
                                                <input
                                                    aria-label={`${label} value`}
                                                    disabled={
                                                        value.state !==
                                                        'limited'
                                                    }
                                                    type="number"
                                                    min="0"
                                                    value={value.value ?? ''}
                                                    onChange={(e) =>
                                                        setData('limits', {
                                                            ...data.limits,
                                                            [key]: {
                                                                ...value,
                                                                value:
                                                                    e.target
                                                                        .value ===
                                                                    ''
                                                                        ? null
                                                                        : Number(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          ),
                                                            },
                                                        })
                                                    }
                                                    className={inputClass}
                                                    placeholder="Value"
                                                />
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    )}
                    {step === 3 && (
                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                            {Object.entries(entitlementDefinitions).map(
                                ([key, label]) => {
                                    const value = data.entitlements[key];

                                    return (
                                        <label
                                            key={key}
                                            className="flex items-center justify-between gap-3 rounded-lg border border-brand-border p-3"
                                        >
                                            <span className="font-semibold">
                                                {label}
                                            </span>
                                            <select
                                                value={value.state}
                                                onChange={(e) =>
                                                    setData('entitlements', {
                                                        ...data.entitlements,
                                                        [key]: {
                                                            ...value,
                                                            state: e.target
                                                                .value,
                                                        },
                                                    })
                                                }
                                                className="min-h-11 rounded-lg border border-brand-border bg-white px-2"
                                            >
                                                <option value="included">
                                                    Included
                                                </option>
                                                <option value="excluded">
                                                    Excluded
                                                </option>
                                                <option value="limited">
                                                    Limited
                                                </option>
                                                <option value="custom">
                                                    Custom
                                                </option>
                                                <option value="unavailable">
                                                    Unavailable
                                                </option>
                                            </select>
                                        </label>
                                    );
                                },
                            )}
                        </div>
                    )}
                    {step === 4 && (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <Field label="Support tier">
                                <select
                                    value={data.support_configuration.tier}
                                    onChange={(e) =>
                                        setData('support_configuration', {
                                            ...data.support_configuration,
                                            tier: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                >
                                    {supportTiers.map((tier) => (
                                        <option key={tier}>{tier}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Included training sessions">
                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        data.support_configuration
                                            .training_sessions
                                    }
                                    onChange={(e) =>
                                        setData('support_configuration', {
                                            ...data.support_configuration,
                                            training_sessions: Number(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            {(
                                [
                                    'administrator_orientation',
                                    'system_health_review',
                                    'hosting_included',
                                    'backups_included',
                                    'maintenance_included',
                                    'product_updates',
                                    'email_support',
                                    'priority_support',
                                ] as const
                            ).map((key) => (
                                <label
                                    key={key}
                                    className="flex min-h-11 items-center gap-3 rounded-lg border border-brand-border p-3"
                                >
                                    <input
                                        type="checkbox"
                                        checked={
                                            data.support_configuration[key]
                                        }
                                        onChange={(e) =>
                                            setData('support_configuration', {
                                                ...data.support_configuration,
                                                [key]: e.target.checked,
                                            })
                                        }
                                        className="size-5"
                                    />
                                    <span className="font-semibold">
                                        {key.replaceAll('_', ' ')}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                    {step === 5 && (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <Review title="Plan">
                                {data.name || plan?.name || 'Unnamed plan'} ·{' '}
                                {data.code || plan?.code}
                                <br />
                                {data.family}
                            </Review>
                            <Review title="Version and term">
                                Version {data.version_number} ·{' '}
                                {data.billing_cycle}
                                <br />
                                Effective {data.effective_from || 'Unavailable'}
                            </Review>
                            <Review title="Indicative standard pricing">
                                Onboarding: {data.currency}{' '}
                                {data.implementation_amount || 'Unavailable'}
                                <br />
                                Recurring: {data.currency}{' '}
                                {data.recurring_amount || 'Unavailable'}
                                <br />
                                Renewal: {data.currency}{' '}
                                {data.renewal_amount || 'Unavailable'}
                            </Review>
                            <Review title="Configuration">
                                {
                                    Object.values(data.entitlements).filter(
                                        (item) => item.state === 'included',
                                    ).length
                                }{' '}
                                included entitlements
                                <br />
                                {
                                    Object.values(data.limits).filter(
                                        (item) => item.state === 'limited',
                                    ).length
                                }{' '}
                                limited allowances
                                <br />
                                Support: {data.support_configuration.tier}
                            </Review>
                            <Review title="Change summary">
                                {data.change_summary || 'Missing'}
                            </Review>
                            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                                <p className="font-bold">Draft only</p>
                                <p>
                                    After saving, validate the configuration and
                                    publish it through a separate reasoned
                                    action.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
                <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-brand-border bg-white/95 p-3 backdrop-blur lg:left-[17rem]">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
                        <button
                            type="button"
                            disabled={step === 0}
                            onClick={() => setStep((current) => current - 1)}
                            className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-brand-border px-4 font-semibold disabled:opacity-40"
                        >
                            <ChevronLeft className="size-4" />
                            Previous
                        </button>
                        {step < steps.length - 1 ? (
                            <button
                                type="button"
                                onClick={() =>
                                    setStep((current) => current + 1)
                                }
                                className="inline-flex min-h-11 items-center gap-1 rounded-lg bg-brand-purple px-4 font-semibold text-white"
                            >
                                Next
                                <ChevronRight className="size-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-deep px-5 font-semibold text-white disabled:opacity-60"
                            >
                                <Save className="size-4" />
                                {processing
                                    ? 'Saving…'
                                    : editing
                                      ? 'Save draft changes'
                                      : 'Save as draft'}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </>
    );
}

function Field({
    label,
    help,
    error,
    children,
}: {
    label: string;
    help?: string;
    error?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <label className="grid content-start gap-1.5 text-sm font-semibold">
            <span>{label}</span>
            {children}
            {help && (
                <span className="text-xs font-normal text-brand-muted">
                    {help}
                </span>
            )}
            {error}
        </label>
    );
}
function Review({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-brand-border p-4">
            <h3 className="font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
                {children}
            </p>
        </div>
    );
}
