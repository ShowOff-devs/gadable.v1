import { Form, Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Copy,
    LockKeyhole,
    Pencil,
    ShieldCheck,
} from 'lucide-react';
import { show as planShow } from '@/routes/super-admin/subscription-plans';
import {
    clone,
    edit,
    publish,
    retire,
    validate as validateVersion,
} from '@/routes/super-admin/subscription-plan-versions';

type ValidationResult = {
    code: string;
    severity: string;
    message: string;
    field: string | null;
    suggested_remediation: string | null;
};
type Version = {
    id: number;
    version_number: number;
    status: string;
    currency: string;
    implementation_amount: string | null;
    recurring_amount: string | null;
    renewal_amount: string | null;
    billing_cycle: string;
    vat_rate: string | null;
    vat_inclusive: boolean | null;
    grace_period_days: number;
    effective_from: string | null;
    effective_until: string | null;
    change_summary: string | null;
    entitlements: Record<string, { state: string }>;
    limits: Record<string, { state: string; value?: number | null }>;
    support_configuration: { tier?: string };
    lock_version: number;
    validated_at: string | null;
    validation_results: ValidationResult[] | null;
    subscriptions_count: number;
    snapshot_checksum: string | null;
};

export default function PlanVersionShow({
    plan,
    version,
}: {
    plan: { id: number; name: string; code: string; family: string };
    version: Version;
}) {
    const hasBlockingErrors =
        version.validation_results?.some(
            (result) => result.severity === 'error',
        ) ?? true;

    return (
        <>
            <Head title={`${plan.name} Version ${version.version_number}`} />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                <header>
                    <Link
                        href={planShow(plan.id).url}
                        className="text-sm font-semibold text-brand-purple"
                    >
                        ← {plan.name}
                    </Link>
                    <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-brand-muted">
                                {plan.code}
                            </p>
                            <h1 className="text-3xl font-bold">
                                Version {version.version_number}
                            </h1>
                            <p className="mt-1 text-sm text-brand-muted">
                                {plan.family}
                            </p>
                        </div>
                        <span className="flex items-center gap-2 rounded-full bg-brand-soft px-3 py-2 text-sm font-bold">
                            {version.status !== 'draft' && (
                                <LockKeyhole className="size-4" />
                            )}
                            {version.status.replaceAll('_', ' ')}
                        </span>
                    </div>
                </header>
                <div className="flex flex-wrap gap-2">
                    {version.status === 'draft' && (
                        <>
                            <Link
                                href={edit([plan.id, version.id]).url}
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-border bg-white px-4 font-semibold"
                            >
                                <Pencil className="size-4" />
                                Edit draft
                            </Link>
                            <Form
                                {...validateVersion.form([plan.id, version.id])}
                            >
                                {({ processing }) => (
                                    <button
                                        disabled={processing}
                                        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-purple px-4 font-semibold text-white"
                                    >
                                        <ShieldCheck className="size-4" />
                                        {processing
                                            ? 'Validating…'
                                            : 'Validate configuration'}
                                    </button>
                                )}
                            </Form>
                        </>
                    )}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    <section className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-bold">
                            Commercial snapshot
                        </h2>
                        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <Item
                                label="Onboarding"
                                value={
                                    version.implementation_amount === null
                                        ? 'Unavailable'
                                        : `${version.currency} ${version.implementation_amount}`
                                }
                            />
                            <Item
                                label="Recurring"
                                value={
                                    version.recurring_amount === null
                                        ? 'Unavailable'
                                        : `${version.currency} ${version.recurring_amount}`
                                }
                            />
                            <Item
                                label="Renewal"
                                value={
                                    version.renewal_amount === null
                                        ? 'Unavailable'
                                        : `${version.currency} ${version.renewal_amount}`
                                }
                            />
                            <Item
                                label="VAT"
                                value={
                                    version.vat_rate === null
                                        ? 'Unavailable'
                                        : `${version.vat_rate}% · ${version.vat_inclusive ? 'inclusive' : 'exclusive'}`
                                }
                            />
                            <Item
                                label="Effective date"
                                value={version.effective_from ?? 'Unavailable'}
                            />
                            <Item
                                label="Grace period"
                                value={`${version.grace_period_days} days`}
                            />
                        </dl>
                    </section>
                    <section className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-bold">
                            Configuration summary
                        </h2>
                        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <Item
                                label="Entitlements"
                                value={`${Object.keys(version.entitlements).length} explicit states`}
                            />
                            <Item
                                label="Limits"
                                value={`${Object.keys(version.limits ?? {}).length} explicit states`}
                            />
                            <Item
                                label="Support tier"
                                value={
                                    version.support_configuration?.tier ??
                                    'Unavailable'
                                }
                            />
                            <Item
                                label="Assigned organizations"
                                value={String(version.subscriptions_count)}
                            />
                        </dl>
                        <p className="mt-4 text-sm text-brand-muted">
                            {version.change_summary ??
                                'No change summary available.'}
                        </p>
                    </section>
                </div>
                <section className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-bold">Validation</h2>
                    <p className="mt-1 text-sm text-brand-muted">
                        {version.validated_at
                            ? `Last validated ${version.validated_at}`
                            : 'This draft has not been validated.'}
                    </p>
                    {version.validation_results &&
                        version.validation_results.length === 0 && (
                            <p className="mt-4 flex items-center gap-2 font-semibold text-emerald-800">
                                <CheckCircle2 className="size-5" />
                                No blocking configuration issues.
                            </p>
                        )}
                    {version.validation_results &&
                        version.validation_results.length > 0 && (
                            <ul className="mt-4 grid gap-2">
                                {version.validation_results.map((result) => (
                                    <li
                                        key={result.code}
                                        className={`rounded-lg border p-3 ${result.severity === 'error' ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`}
                                    >
                                        <p className="flex items-center gap-2 font-bold">
                                            <AlertTriangle className="size-4" />
                                            {result.message}
                                        </p>
                                        {result.suggested_remediation && (
                                            <p className="mt-1 text-sm">
                                                {result.suggested_remediation}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                </section>
                {version.status === 'draft' && (
                    <section className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-bold">
                            Publish immutable version
                        </h2>
                        <p className="mt-2 text-sm text-brand-muted">
                            Publication locks prices, limits, entitlements, and
                            support terms. It does not migrate existing
                            organizations.
                        </p>
                        <Form
                            {...publish.form([plan.id, version.id])}
                            className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <input
                                        type="hidden"
                                        name="lock_version"
                                        value={version.lock_version}
                                    />
                                    <label className="grid gap-1 text-sm font-semibold">
                                        Publication reason
                                        <textarea
                                            name="reason"
                                            minLength={10}
                                            required
                                            className="min-h-24 rounded-lg border border-brand-border p-3"
                                        />
                                    </label>
                                    <button
                                        disabled={
                                            processing ||
                                            hasBlockingErrors ||
                                            !version.validated_at
                                        }
                                        className="self-end rounded-lg bg-brand-deep px-5 py-3 font-semibold text-white disabled:opacity-40"
                                    >
                                        {processing
                                            ? 'Publishing…'
                                            : 'Publish version'}
                                    </button>
                                    {errors.publication && (
                                        <p className="text-sm text-red-700">
                                            {errors.publication}
                                        </p>
                                    )}
                                </>
                            )}
                        </Form>
                    </section>
                )}
                {version.status !== 'draft' && (
                    <div className="grid gap-4 lg:grid-cols-2">
                        <section className="rounded-xl border border-brand-border bg-white p-5">
                            <h2 className="flex items-center gap-2 text-lg font-bold">
                                <Copy className="size-5" />
                                Create new version
                            </h2>
                            <Form
                                {...clone.form([plan.id, version.id])}
                                className="mt-4 grid gap-3"
                            >
                                {({ processing }) => (
                                    <>
                                        <label className="grid gap-1 text-sm font-semibold">
                                            New version number
                                            <input
                                                name="version_number"
                                                type="number"
                                                min={version.version_number + 1}
                                                required
                                                className="min-h-11 rounded-lg border border-brand-border px-3"
                                            />
                                        </label>
                                        <label className="grid gap-1 text-sm font-semibold">
                                            Change summary
                                            <textarea
                                                name="change_summary"
                                                minLength={10}
                                                required
                                                className="min-h-20 rounded-lg border border-brand-border p-3"
                                            />
                                        </label>
                                        <label className="grid gap-1 text-sm font-semibold">
                                            Reason
                                            <textarea
                                                name="reason"
                                                minLength={10}
                                                required
                                                className="min-h-20 rounded-lg border border-brand-border p-3"
                                            />
                                        </label>
                                        <button
                                            disabled={processing}
                                            className="min-h-11 rounded-lg bg-brand-purple px-4 font-semibold text-white"
                                        >
                                            Create draft clone
                                        </button>
                                    </>
                                )}
                            </Form>
                        </section>
                        {version.status === 'published' && (
                            <section className="rounded-xl border border-red-200 bg-white p-5">
                                <h2 className="text-lg font-bold">
                                    Retire version
                                </h2>
                                <p className="mt-2 text-sm text-brand-muted">
                                    Retirement blocks new assignments but
                                    preserves all existing subscriptions.
                                </p>
                                <Form
                                    {...retire.form([plan.id, version.id])}
                                    className="mt-4 grid gap-3"
                                >
                                    {({ processing }) => (
                                        <>
                                            <label className="grid gap-1 text-sm font-semibold">
                                                Retirement reason
                                                <textarea
                                                    name="reason"
                                                    minLength={10}
                                                    required
                                                    className="min-h-24 rounded-lg border border-brand-border p-3"
                                                />
                                            </label>
                                            <button
                                                disabled={processing}
                                                className="min-h-11 rounded-lg bg-red-700 px-4 font-semibold text-white"
                                            >
                                                Retire version
                                            </button>
                                        </>
                                    )}
                                </Form>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
function Item({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-brand-muted">{label}</dt>
            <dd className="font-semibold">{value}</dd>
        </div>
    );
}
