import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { store } from '@/routes/organization-admin/organizations';

type Organization = {
    id: number;
    official_name: string;
    acronym: string | null;
};

export default function SelectOrganization({
    organizations,
}: {
    organizations: Organization[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        organization_id: '',
    });
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(store().url);
    }

    return (
        <>
            <Head title="Select Organization | GADable" />
            <main className="flex min-h-svh items-center justify-center bg-brand-soft px-4 py-8">
                <section className="w-full max-w-lg rounded-2xl border border-brand-border bg-white p-6 sm:p-9">
                    <p className="text-xs font-bold tracking-[0.16em] text-brand-magenta uppercase">
                        Organization Admin Portal
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold">
                        Select your organization
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-brand-muted">
                        Only organizations covered by your current verified
                        designation are shown.
                    </p>
                    <form onSubmit={submit} className="mt-7 grid gap-5">
                        <div className="grid gap-3">
                            {organizations.map((organization) => (
                                <label
                                    key={organization.id}
                                    className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-brand-border p-4 focus-within:ring-3 focus-within:ring-brand-purple/20"
                                >
                                    <input
                                        type="radio"
                                        name="organization_id"
                                        value={organization.id}
                                        checked={
                                            data.organization_id ===
                                            String(organization.id)
                                        }
                                        onChange={(event) =>
                                            setData(
                                                'organization_id',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <span className="font-semibold">
                                        {organization.official_name}
                                        {organization.acronym
                                            ? ` (${organization.acronym})`
                                            : ''}
                                    </span>
                                </label>
                            ))}
                            <InputError message={errors.organization_id} />
                        </div>
                        <button
                            disabled={processing || !data.organization_id}
                            className="min-h-12 rounded-lg bg-brand-purple px-5 py-3 text-sm font-semibold text-white disabled:opacity-65"
                        >
                            {processing ? 'Opening workspace…' : 'Continue'}
                        </button>
                    </form>
                </section>
            </main>
        </>
    );
}
