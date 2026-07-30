import { Head, Link, router } from '@inertiajs/react';
import { Download, FileCheck2, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

type Summary = {
    approved_amount: string | null;
    gad_attributed_amount: string | null;
    financial_status: string;
};
type Pap = {
    id: number;
    reference: string;
    title: string;
    fiscal_year: number;
    workflow_status: string;
    implementing_unit: string | null;
    decision: { status: string; decision_date: string };
    financial_summary: Summary | null;
};
type Props = {
    paps: {
        data: Pap[];
        total: number;
        current_page: number;
        last_page: number;
    };
    filters: { search?: string; fiscal_year?: string };
    metrics: { visible_paps: number; summaries_recorded: number };
};

const money = (value: string | null | undefined) =>
    value == null
        ? 'Not recorded'
        : new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
          }).format(Number(value));

export default function ApprovedPapsIndex({ paps, filters, metrics }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [year, setYear] = useState(filters.fiscal_year ?? '');
    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            '/organization-admin/approved-paps',
            { search, fiscal_year: year },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Approved PAPs & Financials" />
            <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-semibold text-brand-purple">
                            Organization records
                        </p>
                        <h1 className="mt-1 text-2xl font-bold">
                            Approved PAPs & Financials
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm text-brand-muted">
                            Authoritative approved and conditionally approved
                            PAP decisions. Amounts are financial summaries only;
                            this workspace does not process payments or release
                            funds.
                        </p>
                    </div>
                    <a
                        href="/organization-admin/approved-paps/export"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-brand-border bg-white px-4 text-sm font-semibold"
                    >
                        <Download className="size-4" /> Export CSV
                    </a>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-brand-border bg-white p-5">
                        <p className="text-sm text-brand-muted">
                            Approved PAP records
                        </p>
                        <p className="mt-2 text-3xl font-bold">
                            {metrics.visible_paps}
                        </p>
                    </div>
                    <div className="rounded-xl border border-brand-border bg-white p-5">
                        <p className="text-sm text-brand-muted">
                            Financial summaries recorded
                        </p>
                        <p className="mt-2 text-3xl font-bold">
                            {metrics.summaries_recorded}
                        </p>
                    </div>
                </div>
                <form
                    onSubmit={submit}
                    className="grid gap-3 rounded-xl border border-brand-border bg-white p-4 sm:grid-cols-[1fr_12rem_auto]"
                >
                    <label className="relative">
                        <span className="sr-only">Search</span>
                        <Search className="absolute top-3.5 left-3 size-4 text-brand-muted" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Reference or title"
                            className="min-h-11 w-full rounded-lg border border-brand-border pr-3 pl-10"
                        />
                    </label>
                    <input
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        inputMode="numeric"
                        placeholder="Fiscal year"
                        className="min-h-11 rounded-lg border border-brand-border px-3"
                    />
                    <button className="min-h-11 rounded-lg bg-brand-purple px-5 font-semibold text-white">
                        Apply filters
                    </button>
                </form>
                <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
                    {paps.data.length === 0 ? (
                        <div className="px-6 py-14 text-center">
                            <FileCheck2 className="mx-auto size-8 text-brand-purple" />
                            <p className="mt-3 font-semibold">
                                No eligible PAP decisions found
                            </p>
                            <p className="mt-1 text-sm text-brand-muted">
                                Only authoritative Approved or Conditionally
                                Approved decisions appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left text-sm">
                                <thead className="bg-brand-soft text-xs text-brand-muted uppercase">
                                    <tr>
                                        <th className="px-5 py-3">PAP</th>
                                        <th className="px-5 py-3">
                                            Fiscal year
                                        </th>
                                        <th className="px-5 py-3">Decision</th>
                                        <th className="px-5 py-3">
                                            Approved amount
                                        </th>
                                        <th className="px-5 py-3">
                                            Financial status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border">
                                    {paps.data.map((pap) => (
                                        <tr key={pap.id}>
                                            <td className="px-5 py-4">
                                                <Link
                                                    href={`/organization-admin/approved-paps/${pap.id}`}
                                                    className="font-semibold text-brand-purple hover:underline"
                                                >
                                                    {pap.reference}
                                                </Link>
                                                <p className="mt-1 max-w-md text-brand-muted">
                                                    {pap.title}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                {pap.fiscal_year}
                                            </td>
                                            <td className="px-5 py-4 capitalize">
                                                {pap.decision.status.replaceAll(
                                                    '_',
                                                    ' ',
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {money(
                                                    pap.financial_summary
                                                        ?.approved_amount,
                                                )}
                                            </td>
                                            <td className="px-5 py-4 capitalize">
                                                {pap.financial_summary?.financial_status.replaceAll(
                                                    '_',
                                                    ' ',
                                                ) ?? 'Not recorded'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
