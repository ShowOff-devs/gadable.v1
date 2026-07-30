import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { index, store, update } from '@/routes/super-admin/organizations';

type Option = { value: string; label: string };
type Parent = { id: number; official_name: string; code: string };
type Organization = Record<string, unknown> & {
    id: number;
    lock_version: number;
};

export default function OrganizationForm({
    organization,
    parents,
    classifications,
    referenceDataConfigured,
}: {
    organization?: Organization;
    parents: Parent[];
    classifications: Option[];
    referenceDataConfigured: boolean;
}) {
    const form = useForm({
        official_name: String(organization?.officialName ?? ''),
        code: String(organization?.code ?? ''),
        acronym: String(organization?.acronym ?? ''),
        description: String(organization?.description ?? ''),
        website: String(organization?.website ?? ''),
        email: String(organization?.email ?? ''),
        phone: String(organization?.phone ?? ''),
        established_on: String(organization?.established_on ?? ''),
        parent_id: String(organization?.parent_id ?? ''),
        organization_type: String(organization?.organization_type ?? ''),
        geographic_scope: String(organization?.geographic_scope ?? ''),
        region_name: String(organization?.region_name ?? ''),
        province_name: String(organization?.province_name ?? ''),
        locality_name: String(organization?.locality_name ?? ''),
        address_line: String(organization?.address_line ?? ''),
        official_contact_name: String(
            organization?.official_contact_name ?? '',
        ),
        official_contact_position: String(
            organization?.official_contact_position ?? '',
        ),
        official_contact_email: String(
            organization?.official_contact_email ?? '',
        ),
        data_classification: String(
            organization?.dataClassification ?? 'standard',
        ),
        identity_verified: Boolean(organization?.identity_verified),
        authority_verified: Boolean(organization?.authority_verified),
        primary_admin_ready: Boolean(organization?.primary_admin_ready),
        subscription_ready: Boolean(organization?.subscription_ready),
        security_ready: Boolean(organization?.security_ready),
        has_critical_issue: Boolean(organization?.has_critical_issue),
        confirm_duplicate: false,
        hierarchy_reason: '',
        lock_version: organization?.lock_version ?? 1,
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (organization) {
            form.put(update(organization.id).url);
        } else {
            form.post(store().url);
        }
    };
    const textFields = [
        ['official_name', 'Official name *'],
        ['code', 'Organization code *'],
        ['acronym', 'Acronym'],
        ['email', 'Organization email'],
        ['phone', 'Phone'],
        ['website', 'Website'],
        ['established_on', 'Date established'],
        ['geographic_scope', 'Geographic scope'],
        ['region_name', 'Region'],
        ['province_name', 'Province'],
        ['locality_name', 'City / municipality'],
        ['address_line', 'Address'],
        ['official_contact_name', 'Authorized official'],
        ['official_contact_position', 'Official position'],
        ['official_contact_email', 'Official email'],
    ] as const;
    const readinessFields = [
        ['identity_verified', 'Identity verified'],
        ['authority_verified', 'Administrative authority verified'],
        ['primary_admin_ready', 'Primary Org Admin designation ready'],
        ['subscription_ready', 'Subscription readiness verified'],
        ['security_ready', 'Security configuration ready'],
    ] as const;
    const missingReadiness = readinessFields.filter(
        ([name]) => !form.data[name],
    ).length;

    return (
        <form onSubmit={submit} className="space-y-6">
            {!referenceDataConfigured && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    Authoritative organization-type and geographic reference
                    catalogs are not configured. These optional fields are
                    recorded as supplied and must be reconciled when approved
                    catalogs are available.
                </div>
            )}
            <section className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">
                {textFields.map(([name, label]) => (
                    <label
                        key={name}
                        className={
                            name === 'address_line' ? 'sm:col-span-2' : ''
                        }
                    >
                        <span className="mb-1.5 block text-sm font-semibold">
                            {label}
                        </span>
                        <Input
                            type={
                                name === 'established_on'
                                    ? 'date'
                                    : name.includes('email')
                                      ? 'email'
                                      : name === 'website'
                                        ? 'url'
                                        : 'text'
                            }
                            value={String(form.data[name])}
                            onChange={(e) => form.setData(name, e.target.value)}
                        />
                        <InputError message={form.errors[name]} />
                    </label>
                ))}
                <label>
                    <span className="mb-1.5 block text-sm font-semibold">
                        Parent organization
                    </span>
                    <select
                        className="h-10 w-full rounded-md border px-3"
                        value={form.data.parent_id}
                        onChange={(e) =>
                            form.setData('parent_id', e.target.value)
                        }
                    >
                        <option value="">None</option>
                        {parents.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.official_name} ({p.code})
                            </option>
                        ))}
                    </select>
                    <InputError message={form.errors.parent_id} />
                </label>
                <label>
                    <span className="mb-1.5 block text-sm font-semibold">
                        Data classification *
                    </span>
                    <select
                        className="h-10 w-full rounded-md border px-3"
                        value={form.data.data_classification}
                        onChange={(e) =>
                            form.setData('data_classification', e.target.value)
                        }
                    >
                        {classifications.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="sm:col-span-2">
                    <span className="mb-1.5 block text-sm font-semibold">
                        Description
                    </span>
                    <textarea
                        className="min-h-28 w-full rounded-md border p-3"
                        value={form.data.description}
                        onChange={(e) =>
                            form.setData('description', e.target.value)
                        }
                    />
                </label>
            </section>
            <section
                id="activation-readiness"
                className="rounded-xl border bg-white p-5"
            >
                <h2 className="font-semibold">Activation readiness</h2>
                <p className="mb-4 text-sm text-brand-muted">
                    These attestations are audited when saved. They do not
                    provision users or subscriptions.
                </p>
                {(missingReadiness > 0 || form.data.has_critical_issue) && (
                    <div
                        role="alert"
                        className={`mb-4 rounded-lg border p-4 ${
                            form.data.has_critical_issue
                                ? 'border-red-300 bg-red-50 text-red-900'
                                : 'border-amber-300 bg-amber-50 text-amber-900'
                        }`}
                    >
                        <p className="font-semibold">
                            {form.data.has_critical_issue
                                ? 'Critical issue unresolved'
                                : `${missingReadiness} readiness ${missingReadiness === 1 ? 'requirement is' : 'requirements are'} still missing`}
                        </p>
                        <p className="mt-1 text-sm">
                            {form.data.has_critical_issue
                                ? 'Resolve the recorded issue, then clear “Critical issue present” before saving.'
                                : 'Complete every item marked Missing before requesting activation.'}
                        </p>
                    </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                    {readinessFields.map(([name, label]) => (
                        <label
                            key={name}
                            className={`flex min-h-14 items-center gap-3 rounded-lg border p-3 ${
                                form.data[name]
                                    ? 'border-emerald-300 bg-emerald-50'
                                    : 'border-amber-300 bg-amber-50'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={form.data[name]}
                                onChange={(e) =>
                                    form.setData(name, e.target.checked)
                                }
                            />
                            <span className="flex-1">{label}</span>
                            <span
                                className={`text-xs font-bold uppercase ${
                                    form.data[name]
                                        ? 'text-emerald-800'
                                        : 'text-amber-900'
                                }`}
                            >
                                {form.data[name] ? 'Complete' : 'Missing'}
                            </span>
                        </label>
                    ))}
                    <label
                        className={`flex min-h-14 items-center gap-3 rounded-lg border p-3 ${
                            form.data.has_critical_issue
                                ? 'border-red-300 bg-red-50'
                                : 'border-emerald-300 bg-emerald-50'
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={form.data.has_critical_issue}
                            onChange={(event) =>
                                form.setData(
                                    'has_critical_issue',
                                    event.target.checked,
                                )
                            }
                        />
                        <span className="flex-1">Critical issue present</span>
                        <span
                            className={`text-xs font-bold uppercase ${
                                form.data.has_critical_issue
                                    ? 'text-red-800'
                                    : 'text-emerald-800'
                            }`}
                        >
                            {form.data.has_critical_issue
                                ? 'Unresolved'
                                : 'Clear'}
                        </span>
                    </label>
                </div>
            </section>
            {organization && (
                <section className="rounded-xl border bg-white p-5">
                    <label>
                        <span className="mb-1.5 block text-sm font-semibold">
                            Hierarchy change reason
                        </span>
                        <textarea
                            className="min-h-24 w-full rounded-md border p-3"
                            value={form.data.hierarchy_reason}
                            onChange={(event) =>
                                form.setData(
                                    'hierarchy_reason',
                                    event.target.value,
                                )
                            }
                            aria-describedby="hierarchy-reason-help"
                        />
                        <span
                            id="hierarchy-reason-help"
                            className="mt-1 block text-xs text-brand-muted"
                        >
                            Required when changing the parent of an active
                            organization.
                        </span>
                        <InputError message={form.errors.hierarchy_reason} />
                    </label>
                </section>
            )}
            {form.errors.confirm_duplicate && (
                <section
                    role="alert"
                    className="rounded-xl border border-amber-300 bg-amber-50 p-5"
                >
                    <p className="text-sm text-amber-900">
                        {form.errors.confirm_duplicate}
                    </p>
                    <label className="mt-3 flex min-h-11 items-center gap-3 font-semibold">
                        <input
                            type="checkbox"
                            checked={form.data.confirm_duplicate}
                            onChange={(event) =>
                                form.setData(
                                    'confirm_duplicate',
                                    event.target.checked,
                                )
                            }
                        />
                        I reviewed the possible duplicate and intend to create a
                        separate organization.
                    </label>
                </section>
            )}
            <div className="flex justify-end gap-3">
                <Button asChild variant="outline">
                    <Link href={index().url}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing
                        ? 'Saving…'
                        : organization
                          ? 'Save changes'
                          : 'Register organization'}
                </Button>
            </div>
        </form>
    );
}
