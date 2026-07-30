import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    edit,
    index,
    onboardingTransition,
    statusTransition,
} from '@/routes/super-admin/organizations';
type Option = { value: string; label: string };
type Org = Record<string, unknown> & {
    id: number;
    officialName: string;
    code: string;
    accountStatus: string;
    onboardingStatus: string;
    dataClassification: string;
    activationReady: boolean;
    activationBlockers: string[];
    lock_version: number;
    events: {
        id: number;
        action: string;
        reason: string | null;
        reference: string;
        createdAt: string;
    }[];
    documents: { id: number; name: string; type: string; scanStatus: string }[];
    children: { id: number; officialName: string; code: string }[];
};
const label = (v: string) =>
    v.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
function Transition({
    kind,
    options,
    org,
}: {
    kind: 'onboarding' | 'status';
    options: Option[];
    org: Org;
}) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        target: '',
        reason: '',
        lock_version: org.lock_version,
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(
            (kind === 'onboarding'
                ? onboardingTransition(org.id)
                : statusTransition(org.id)
            ).url,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    form.reset();
                },
            },
        );
    };

    return (
        <section className="grid gap-3 rounded-xl border bg-white p-5">
            <h2 className="font-semibold">{label(kind)} transition</h2>
            {options.length === 0 ? (
                <p className="text-sm text-brand-muted">
                    No further transitions are available.
                </p>
            ) : (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            Review available actions
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={submit}>
                            <DialogHeader>
                                <DialogTitle>
                                    Confirm {label(kind)} transition
                                </DialogTitle>
                                <DialogDescription>
                                    This high-impact action changes governance
                                    state and creates an append-only audit
                                    event.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="my-5 grid gap-4">
                                <label>
                                    <span className="mb-1.5 block text-sm font-semibold">
                                        Target status
                                    </span>
                                    <select
                                        className="h-11 w-full rounded-md border px-3"
                                        value={form.data.target}
                                        onChange={(event) =>
                                            form.setData(
                                                'target',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select target status
                                        </option>
                                        {options.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                                disabled={
                                                    option.value === 'active' &&
                                                    !org.activationReady
                                                }
                                            >
                                                {option.label}
                                                {option.value === 'active' &&
                                                !org.activationReady
                                                    ? ' — complete readiness first'
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    <span className="mb-1.5 block text-sm font-semibold">
                                        Required reason
                                    </span>
                                    <textarea
                                        required
                                        minLength={10}
                                        className="min-h-28 w-full rounded-md border p-3"
                                        value={form.data.reason}
                                        onChange={(event) =>
                                            form.setData(
                                                'reason',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </label>
                                <div role="alert" aria-live="polite">
                                    {Object.values(form.errors).map(
                                        (error, index) => (
                                            <p
                                                key={index}
                                                className="text-sm text-red-600"
                                            >
                                                {error}
                                            </p>
                                        ),
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    disabled={
                                        form.processing ||
                                        !form.data.target ||
                                        form.data.reason.length < 10
                                    }
                                    variant={
                                        [
                                            'terminated',
                                            'archived',
                                            'suspended',
                                            'rejected',
                                        ].includes(form.data.target)
                                            ? 'destructive'
                                            : 'default'
                                    }
                                >
                                    {form.processing
                                        ? 'Applying…'
                                        : `Confirm ${label(form.data.target || kind)}`}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </section>
    );
}
export default function Show({
    organization: o,
    onboardingOptions,
    statusOptions,
}: {
    organization: Org;
    onboardingOptions: Option[];
    statusOptions: Option[];
}) {
    const checks = [
        ['identity_verified', 'Identity'],
        ['authority_verified', 'Authority'],
        ['primary_admin_ready', 'Primary admin'],
        ['subscription_ready', 'Subscription'],
        ['security_ready', 'Security'],
    ];

    return (
        <>
            <Head title={o.officialName} />
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex flex-wrap justify-between gap-4">
                    <div>
                        <Link
                            href={index().url}
                            className="text-sm text-brand-purple"
                        >
                            ← Organizations
                        </Link>
                        <h1 className="mt-2 text-2xl font-bold">
                            {o.officialName}
                        </h1>
                        <p className="text-brand-muted">
                            {o.code} · {label(o.accountStatus)} ·{' '}
                            {label(o.onboardingStatus)}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={edit(o.id).url}>Edit profile</Link>
                    </Button>
                </div>
                <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
                    <div className="space-y-6">
                        <section className="rounded-xl border bg-white p-5">
                            <h2 className="mb-4 font-semibold">
                                Organization profile
                            </h2>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                {[
                                    [
                                        'Classification',
                                        String(
                                            o.organization_type ??
                                                'Not configured',
                                        ),
                                    ],
                                    [
                                        'Data classification',
                                        label(o.dataClassification),
                                    ],
                                    ['Email', String(o.email ?? '—')],
                                    ['Website', String(o.website ?? '—')],
                                    [
                                        'Geographic scope',
                                        String(
                                            o.geographic_scope ??
                                                'Not configured',
                                        ),
                                    ],
                                    ['Parent', String(o.parent ?? 'None')],
                                ].map(([k, v]) => (
                                    <div key={k}>
                                        <dt className="text-xs font-semibold text-brand-muted uppercase">
                                            {k}
                                        </dt>
                                        <dd>{v}</dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                        <section className="rounded-xl border bg-white p-5">
                            <h2 className="font-semibold">
                                Activation readiness
                            </h2>
                            <p
                                className={`mt-1 text-sm ${o.activationReady ? 'text-green-700' : 'text-amber-700'}`}
                            >
                                {o.activationReady
                                    ? 'All enforced prerequisites are satisfied.'
                                    : 'Activation remains blocked.'}
                            </p>
                            {!o.activationReady && (
                                <div
                                    role="status"
                                    className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4"
                                >
                                    <h3 className="font-semibold text-amber-950">
                                        Complete these requirements
                                    </h3>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                                        {o.activationBlockers.map((blocker) => (
                                            <li key={blocker}>{blocker}</li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={edit(o.id).url}
                                        className="mt-4 inline-flex min-h-11 items-center rounded-md bg-brand-purple px-4 text-sm font-semibold text-white hover:bg-brand-deep focus-visible:ring-3 focus-visible:ring-brand-purple/25 focus-visible:outline-none"
                                    >
                                        Complete readiness in Edit Profile
                                    </Link>
                                    {o.onboardingStatus !== 'approved' && (
                                        <p className="mt-3 text-sm text-amber-900">
                                            Onboarding approval is completed
                                            through the audited Onboarding
                                            transition panel, not the edit form.
                                        </p>
                                    )}
                                </div>
                            )}
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                {checks.map(([key, name]) => (
                                    <div
                                        key={key}
                                        className={`rounded-lg border p-3 ${
                                            o[key]
                                                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                                                : 'border-amber-300 bg-amber-50 text-amber-950'
                                        }`}
                                    >
                                        <p className="font-medium">{name}</p>
                                        <p className="mt-1 text-xs font-bold uppercase">
                                            {o[key] ? 'Complete' : 'Missing'}
                                        </p>
                                    </div>
                                ))}
                                <div
                                    className={`rounded-lg border p-3 ${
                                        o.has_critical_issue
                                            ? 'border-red-300 bg-red-50 text-red-900'
                                            : 'border-emerald-300 bg-emerald-50 text-emerald-900'
                                    }`}
                                >
                                    <p className="font-medium">
                                        Critical issues
                                    </p>
                                    <p className="mt-1 text-xs font-bold uppercase">
                                        {o.has_critical_issue
                                            ? 'Unresolved — activation blocked'
                                            : 'Clear'}
                                    </p>
                                </div>
                                <div
                                    className={`rounded-lg border p-3 ${
                                        o.onboardingStatus === 'approved'
                                            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                                            : 'border-amber-300 bg-amber-50 text-amber-950'
                                    }`}
                                >
                                    <p className="font-medium">
                                        Onboarding approved
                                    </p>
                                    <p className="mt-1 text-xs font-bold uppercase">
                                        {o.onboardingStatus === 'approved'
                                            ? 'Complete'
                                            : `Missing — currently ${label(o.onboardingStatus)}`}
                                    </p>
                                </div>
                            </div>
                        </section>
                        <section className="rounded-xl border bg-white p-5">
                            <h2 className="font-semibold">
                                Subscription, tools, and features
                            </h2>
                            <p className="mt-2 text-sm text-brand-muted">
                                Not configured. No entitlements or quotas are
                                inferred.
                            </p>
                        </section>
                        <section className="rounded-xl border bg-white p-5">
                            <h2 className="font-semibold">
                                Supporting documents
                            </h2>
                            <p className="mt-2 text-sm text-amber-700">
                                Malware scanning is not configured. Uploaded
                                files remain private and quarantined with no
                                download route.
                            </p>
                            {o.documents.map((d) => (
                                <div
                                    key={d.id}
                                    className="mt-3 rounded-lg border p-3 text-sm"
                                >
                                    {d.name} · {d.type} · {label(d.scanStatus)}
                                </div>
                            ))}
                        </section>
                        <section className="rounded-xl border bg-white p-5">
                            <h2 className="mb-4 font-semibold">
                                Activity history
                            </h2>
                            <div className="space-y-4">
                                {o.events.map((e) => (
                                    <article
                                        key={e.id}
                                        className="border-l-2 pl-4"
                                    >
                                        <p className="font-medium">
                                            {label(
                                                e.action.replace(
                                                    'organization.',
                                                    '',
                                                ),
                                            )}
                                        </p>
                                        <p className="text-sm text-brand-muted">
                                            {new Date(
                                                e.createdAt,
                                            ).toLocaleString()}{' '}
                                            · {e.reference}
                                        </p>
                                        {e.reason && (
                                            <p className="mt-1 text-sm">
                                                {e.reason}
                                            </p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>
                    <aside className="space-y-4">
                        <Transition
                            kind="onboarding"
                            options={onboardingOptions}
                            org={o}
                        />
                        <Transition
                            kind="status"
                            options={statusOptions}
                            org={o}
                        />
                    </aside>
                </div>
            </div>
        </>
    );
}
