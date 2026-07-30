import { Head, Link, router } from '@inertiajs/react';
import { Building2, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { create, edit, index, show } from '@/routes/super-admin/organizations';

type Row = {
    id: number;
    officialName: string;
    code: string;
    acronym: string | null;
    type: string | null;
    accountStatus: string;
    onboardingStatus: string;
    parent: string | null;
    updatedAt: string;
};
type Page = {
    data: Row[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number | null;
    to: number | null;
    total: number;
};
const label = (value: string) =>
    value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function Index({
    organizations,
    filters,
    filterOptions,
    counts,
}: {
    organizations: Page;
    filters: Record<string, string | undefined>;
    filterOptions: {
        types: string[];
        regions: string[];
        parents: { id: number; official_name: string }[];
        classifications: { value: string; label: string }[];
    };
    counts: Record<string, number>;
}) {
    const apply = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        router.get(index().url, data, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Organizations" />
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Organizations</h1>
                        <p className="text-brand-muted">
                            Govern organization onboarding, hierarchy, and
                            lifecycle.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create().url}>
                            <Plus />
                            Register organization
                        </Link>
                    </Button>
                </div>
                <div className="mb-6 grid gap-3 sm:grid-cols-4">
                    {Object.entries(counts).map(([key, value]) => (
                        <div
                            key={key}
                            className="rounded-xl border bg-white p-4"
                        >
                            <p className="text-sm text-brand-muted">
                                {label(key)}
                            </p>
                            <p className="text-2xl font-bold">{value}</p>
                        </div>
                    ))}
                </div>
                <form
                    onSubmit={apply}
                    className="mb-5 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    <label className="relative">
                        <span className="sr-only">Search</span>
                        <Search className="absolute top-3 left-3 size-4 text-brand-muted" />
                        <input
                            name="search"
                            defaultValue={filters.search}
                            placeholder="Name, code, email, or location"
                            className="h-10 w-full rounded-md border pr-3 pl-9"
                        />
                    </label>
                    <select
                        name="status"
                        defaultValue={filters.status ?? ''}
                        className="h-10 rounded-md border px-3"
                    >
                        <option value="">All account statuses</option>
                        {[
                            'pending_activation',
                            'active',
                            'restricted',
                            'suspended',
                            'archived',
                            'terminated',
                        ].map((v) => (
                            <option key={v} value={v}>
                                {label(v)}
                            </option>
                        ))}
                    </select>
                    <select
                        name="onboarding"
                        defaultValue={filters.onboarding ?? ''}
                        className="h-10 rounded-md border px-3"
                    >
                        <option value="">All onboarding</option>
                        {[
                            'draft',
                            'submitted',
                            'under_review',
                            'for_clarification',
                            'verified',
                            'approved',
                            'rejected',
                            'cancelled',
                        ].map((v) => (
                            <option key={v} value={v}>
                                {label(v)}
                            </option>
                        ))}
                    </select>
                    <select
                        name="type"
                        defaultValue={filters.type ?? ''}
                        className="h-10 rounded-md border px-3"
                        aria-label="Organization type"
                    >
                        <option value="">All organization types</option>
                        {filterOptions.types.map((value) => (
                            <option key={value}>{value}</option>
                        ))}
                    </select>
                    <select
                        name="region"
                        defaultValue={filters.region ?? ''}
                        className="h-10 rounded-md border px-3"
                        aria-label="Region"
                    >
                        <option value="">All regions</option>
                        {filterOptions.regions.map((value) => (
                            <option key={value}>{value}</option>
                        ))}
                    </select>
                    <select
                        name="classification"
                        defaultValue={filters.classification ?? ''}
                        className="h-10 rounded-md border px-3"
                        aria-label="Data classification"
                    >
                        <option value="">All classifications</option>
                        {filterOptions.classifications.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <select
                        name="parent"
                        defaultValue={filters.parent ?? ''}
                        className="h-10 rounded-md border px-3"
                        aria-label="Parent organization"
                    >
                        <option value="">All parent organizations</option>
                        {filterOptions.parents.map((parent) => (
                            <option key={parent.id} value={parent.id}>
                                {parent.official_name}
                            </option>
                        ))}
                    </select>
                    <select
                        name="sort"
                        defaultValue={filters.sort ?? 'name'}
                        className="h-10 rounded-md border px-3"
                        aria-label="Sort organizations"
                    >
                        <option value="name">Name A–Z</option>
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="last_activity">Recent activity</option>
                    </select>
                    <Button type="submit">Apply</Button>
                    <Button asChild variant="outline">
                        <Link href={index().url}>Clear filters</Link>
                    </Button>
                </form>
                <div className="overflow-hidden rounded-xl border bg-white">
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-sm">
                            <thead className="bg-brand-soft text-left">
                                <tr>
                                    {[
                                        'Organization',
                                        'Type',
                                        'Onboarding',
                                        'Account',
                                        'Parent',
                                        'Actions',
                                    ].map((x) => (
                                        <th key={x} className="p-4">
                                            {x}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {organizations.data.map((o) => (
                                    <tr key={o.id} className="border-t">
                                        <td className="p-4">
                                            <Link
                                                className="font-semibold text-brand-purple hover:underline"
                                                href={show(o.id).url}
                                            >
                                                {o.officialName}
                                            </Link>
                                            <div className="text-xs text-brand-muted">
                                                {o.code}
                                                {o.acronym
                                                    ? ` · ${o.acronym}`
                                                    : ''}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {o.type ?? 'Not configured'}
                                        </td>
                                        <td className="p-4">
                                            {label(o.onboardingStatus)}
                                        </td>
                                        <td className="p-4">
                                            {label(o.accountStatus)}
                                        </td>
                                        <td className="p-4">
                                            {o.parent ?? '—'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Link href={show(o.id).url}>
                                                        View
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Link
                                                        href={edit(o.id).url}
                                                        aria-label={`Edit ${o.officialName}`}
                                                    >
                                                        Edit
                                                    </Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="grid gap-3 p-3 md:hidden">
                        {organizations.data.map((o) => (
                            <article
                                key={o.id}
                                className="rounded-lg border p-4"
                            >
                                <p className="font-semibold">
                                    {o.officialName}
                                </p>
                                <p className="text-sm text-brand-muted">
                                    {o.code}
                                </p>
                                <p className="mt-2 text-sm">
                                    {label(o.accountStatus)} ·{' '}
                                    {label(o.onboardingStatus)}
                                </p>
                                <div className="mt-4 flex gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={show(o.id).url}>View</Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link
                                            href={edit(o.id).url}
                                            aria-label={`Edit ${o.officialName}`}
                                        >
                                            Edit
                                        </Link>
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </div>
                    {organizations.data.length === 0 && (
                        <div className="p-12 text-center">
                            <Building2 className="mx-auto mb-3 size-8 text-brand-muted" />
                            <p className="font-semibold">
                                No organizations found
                            </p>
                        </div>
                    )}
                </div>
                <nav
                    aria-label="Pagination"
                    className="mt-5 flex flex-wrap gap-2"
                >
                    {organizations.links.map((link, i) =>
                        link.url ? (
                            <Link
                                key={i}
                                href={link.url}
                                preserveScroll
                                className={`rounded-md border px-3 py-2 text-sm ${link.active ? 'bg-brand-deep text-white' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={i}
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
