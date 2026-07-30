import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, BarChart3, Download, Info } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

type Money = string | null;
type Distribution = Record<string, number>;
type Finding = {
    issue_type: string;
    severity: string;
    count: number;
    description: string;
    action: string;
};
type Pap = {
    id: number;
    reference: string;
    title: string;
    fiscal_year: number;
    workflow_status: string;
    decision: { status: string; decision_date: string } | null;
    financial_summary: {
        requested_amount: Money;
        recommended_amount: Money;
        approved_amount: Money;
        gad_attributed_amount: Money;
        financial_status: string;
    } | null;
};
type Props = {
    section: string;
    filters: Record<string, string | number>;
    analytics: {
        cards: Record<string, number>;
        financial: Record<string, Money | number>;
        decision_distribution: Distribution;
        financial_status_distribution: Distribution;
        quality_findings: Finding[];
        baselines: Array<{
            fiscal_year: number;
            total_annual_budget: Money;
            approved_gad_budget: Money;
            benchmark: Money;
            allocation_rate: string | null;
        }>;
        unavailable_sections: Array<{ name: string; reason: string }>;
    };
    records: {
        data: Pap[];
        total: number;
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    metricDefinitions: Array<{
        metric_key: string;
        display_name: string;
        description: string;
        calculation: string;
        null_handling: string;
    }>;
};

const money = (value: unknown) =>
    value == null
        ? 'Data unavailable'
        : new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
          }).format(Number(value));
const label = (value: string) =>
    value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
const tabs = [
    ['overview', 'Overview'],
    ['decisions', 'Decisions'],
    ['financial', 'Financial Summary'],
    ['data-quality', 'Data Quality'],
    ['unavailable', 'Other Reports'],
];

export default function ReportsAnalytics({
    section,
    filters,
    analytics,
    records,
    metricDefinitions,
}: Props) {
    const [search, setSearch] = useState(String(filters.search ?? ''));
    const [year, setYear] = useState(String(filters.fiscal_year ?? ''));
    const [decision, setDecision] = useState(
        String(filters.decision_status ?? ''),
    );
    const [financial, setFinancial] = useState(
        String(filters.financial_status ?? ''),
    );
    const query = (extra: Record<string, string> = {}) => ({
        ...filters,
        search: search || undefined,
        fiscal_year: year || undefined,
        decision_status: decision || undefined,
        financial_status: financial || undefined,
        section,
        ...extra,
    });
    const apply = (event: FormEvent) => {
        event.preventDefault();
        router.get('/organization-admin/reports-analytics', query(), {
            preserveState: true,
            replace: true,
        });
    };
    const exportUrl = `/organization-admin/reports-analytics/export?${new URLSearchParams(
        Object.entries(query())
            .filter(([, value]) => value != null)
            .map(([key, value]) => [key, String(value)]),
    ).toString()}`;

    return (
        <>
            <Head title="Reports & Analytics" />
            <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-sm font-semibold text-brand-purple">
                            Organization scope · PHP reporting currency
                        </p>
                        <h1 className="mt-1 text-2xl font-bold">
                            Reports & Analytics
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-muted">
                            Authoritative organization-scoped decision and
                            financial reporting. Missing data remains
                            unavailable and is never inferred.
                        </p>
                    </div>
                    <a
                        href={exportUrl}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-brand-border bg-white px-4 text-sm font-semibold"
                    >
                        <Download className="size-4" />
                        Export current view (CSV)
                    </a>
                </header>
                <nav
                    aria-label="Report sections"
                    className="flex gap-2 overflow-x-auto border-b border-brand-border pb-2"
                >
                    {tabs.map(([key, title]) => (
                        <Link
                            key={key}
                            href={`/organization-admin/reports-analytics?${new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, String(v)])), section: key }).toString()}`}
                            className={`min-h-10 shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${section === key ? 'bg-brand-purple text-white' : 'bg-white text-brand-muted'}`}
                        >
                            {title}
                        </Link>
                    ))}
                </nav>
                <form
                    onSubmit={apply}
                    className="grid gap-3 rounded-xl border border-brand-border bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
                >
                    <label className="text-sm font-medium">
                        Search
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="PAP title or reference"
                            className="mt-1 min-h-11 w-full rounded-lg border border-brand-border px-3"
                        />
                    </label>
                    <label className="text-sm font-medium">
                        Fiscal year
                        <input
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            inputMode="numeric"
                            className="mt-1 min-h-11 w-full rounded-lg border border-brand-border px-3"
                        />
                    </label>
                    <label className="text-sm font-medium">
                        Decision
                        <select
                            value={decision}
                            onChange={(e) => setDecision(e.target.value)}
                            className="mt-1 min-h-11 w-full rounded-lg border border-brand-border px-3"
                        >
                            <option value="">All</option>
                            <option value="approved">Approved</option>
                            <option value="conditionally_approved">
                                Conditionally approved
                            </option>
                            <option value="declined">Declined</option>
                            <option value="returned">Returned</option>
                        </select>
                    </label>
                    <label className="text-sm font-medium">
                        Financial status
                        <select
                            value={financial}
                            onChange={(e) => setFinancial(e.target.value)}
                            className="mt-1 min-h-11 w-full rounded-lg border border-brand-border px-3"
                        >
                            <option value="">All</option>
                            <option value="approved">Approved</option>
                            <option value="partially_approved">
                                Partially approved
                            </option>
                            <option value="under_review">Under review</option>
                            <option value="completed">Completed</option>
                        </select>
                    </label>
                    <div className="flex items-end gap-2">
                        <button className="min-h-11 flex-1 rounded-lg bg-brand-purple px-4 font-semibold text-white">
                            Apply
                        </button>
                        <Link
                            href={`/organization-admin/reports-analytics?section=${section}`}
                            className="inline-flex min-h-11 items-center rounded-lg border border-brand-border px-3 text-sm font-semibold"
                        >
                            Clear
                        </Link>
                    </div>
                </form>
                {section === 'overview' && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {[
                                ['total_paps', 'Total PAPs'],
                                ['approved_paps', 'Approved PAPs'],
                                [
                                    'conditionally_approved_paps',
                                    'Conditionally Approved',
                                ],
                                [
                                    'financial_summaries_completed',
                                    'Financial Summaries',
                                ],
                                ['declined_paps', 'Declined PAPs'],
                                [
                                    'records_requiring_attention',
                                    'Records Requiring Attention',
                                ],
                            ].map(([key, title]) => (
                                <article
                                    key={key}
                                    className="rounded-xl border border-brand-border bg-white p-5"
                                >
                                    <p className="text-sm text-brand-muted">
                                        {title}
                                    </p>
                                    <p className="mt-2 text-3xl font-bold">
                                        {analytics.cards[key]}
                                    </p>
                                </article>
                            ))}
                        </div>
                        <Distribution
                            title="Decision distribution"
                            data={analytics.decision_distribution}
                        />
                    </>
                )}
                {section === 'decisions' && (
                    <Distribution
                        title="Authoritative decision distribution"
                        data={analytics.decision_distribution}
                    />
                )}
                {section === 'financial' && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {[
                                ['total_pap_cost', 'Total PAP Cost'],
                                ['requested_amount', 'Requested Amount'],
                                ['recommended_amount', 'Recommended Amount'],
                                ['approved_amount', 'Approved/Allotted Amount'],
                                [
                                    'gad_attributed_amount',
                                    'GAD-Attributed Amount',
                                ],
                                ['variance', 'Requested − Approved Variance'],
                            ].map(([key, title]) => (
                                <article
                                    key={key}
                                    className="rounded-xl border border-brand-border bg-white p-5"
                                >
                                    <p className="text-sm text-brand-muted">
                                        {title}
                                    </p>
                                    <p className="mt-2 text-xl font-bold break-words tabular-nums">
                                        {money(analytics.financial[key])}
                                    </p>
                                </article>
                            ))}
                        </div>
                        <Distribution
                            title="Financial-status distribution"
                            data={analytics.financial_status_distribution}
                        />
                        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                            <h2 className="font-bold">
                                Organization-level GAD budget benchmark
                            </h2>
                            <p className="mt-1 text-sm text-amber-900">
                                The 5% figure is a monitoring benchmark
                                requiring human validation. It is not a PAP
                                deduction, payment, or transfer.
                            </p>
                            {analytics.baselines.length === 0 ? (
                                <p className="mt-4 text-sm font-semibold">
                                    Data unavailable — no authorized annual
                                    budget baseline.
                                </p>
                            ) : (
                                <div className="mt-4 grid gap-3">
                                    {analytics.baselines.map((row) => (
                                        <div
                                            key={row.fiscal_year}
                                            className="rounded-lg bg-white p-4 text-sm"
                                        >
                                            <strong>{row.fiscal_year}</strong>
                                            <p className="mt-1">
                                                Annual budget:{' '}
                                                {money(row.total_annual_budget)}{' '}
                                                · Benchmark:{' '}
                                                {money(row.benchmark)} ·
                                                Recorded allocation rate:{' '}
                                                {row.allocation_rate == null
                                                    ? 'Data unavailable'
                                                    : `${row.allocation_rate}%`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
                {section === 'data-quality' && (
                    <section className="rounded-xl border border-brand-border bg-white p-5">
                        <h2 className="font-bold">
                            Records requiring administrative review
                        </h2>
                        {analytics.quality_findings.length === 0 ? (
                            <p className="mt-4 text-sm text-brand-muted">
                                No supported data-quality findings match the
                                current filters.
                            </p>
                        ) : (
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full min-w-[720px] text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-brand-border">
                                            <th className="p-3">Issue</th>
                                            <th className="p-3">Severity</th>
                                            <th className="p-3">Count</th>
                                            <th className="p-3">
                                                Recommended action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.quality_findings.map(
                                            (finding) => (
                                                <tr
                                                    key={finding.issue_type}
                                                    className="border-b border-brand-border"
                                                >
                                                    <td className="p-3">
                                                        <strong>
                                                            {label(
                                                                finding.issue_type,
                                                            )}
                                                        </strong>
                                                        <p className="mt-1 text-brand-muted">
                                                            {
                                                                finding.description
                                                            }
                                                        </p>
                                                    </td>
                                                    <td className="p-3">
                                                        {label(
                                                            finding.severity,
                                                        )}
                                                    </td>
                                                    <td className="p-3 font-bold">
                                                        {finding.count}
                                                    </td>
                                                    <td className="p-3">
                                                        {finding.action}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
                {section === 'unavailable' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {analytics.unavailable_sections.map((item) => (
                            <article
                                key={item.name}
                                className="rounded-xl border border-brand-border bg-white p-5"
                            >
                                <Info className="size-5 text-brand-purple" />
                                <h2 className="mt-3 font-bold">{item.name}</h2>
                                <p className="mt-2 text-sm leading-6 text-brand-muted">
                                    Data unavailable: {item.reason}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
                <RecordsTable records={records} />
                <details className="rounded-xl border border-brand-border bg-white p-5">
                    <summary className="cursor-pointer font-bold">
                        Metric definitions and null handling
                    </summary>
                    <div className="mt-4 grid gap-3">
                        {metricDefinitions.map((metric) => (
                            <article
                                key={metric.metric_key}
                                className="rounded-lg bg-brand-soft p-4 text-sm"
                            >
                                <h3 className="font-semibold">
                                    {metric.display_name}
                                </h3>
                                <p className="mt-1 text-brand-muted">
                                    {metric.description} Calculation:{' '}
                                    {metric.calculation}. {metric.null_handling}
                                </p>
                            </article>
                        ))}
                    </div>
                </details>
            </div>
        </>
    );
}

function Distribution({ title, data }: { title: string; data: Distribution }) {
    const entries = Object.entries(data);

    return (
        <section className="rounded-xl border border-brand-border bg-white p-5">
            <div className="flex items-center gap-2">
                <BarChart3 className="size-5 text-brand-purple" />
                <h2 className="font-bold">{title}</h2>
            </div>
            {entries.length === 0 ? (
                <p className="mt-4 text-sm text-brand-muted">
                    No authoritative records match the filters.
                </p>
            ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {entries.map(([key, value]) => (
                        <div key={key} className="rounded-lg bg-brand-soft p-4">
                            <p className="text-sm text-brand-muted">
                                {label(key)}
                            </p>
                            <p className="mt-1 text-2xl font-bold">{value}</p>
                        </div>
                    ))}
                </div>
            )}
            <p className="sr-only">
                Accessible textual summary:{' '}
                {entries
                    .map(([key, value]) => `${label(key)} ${value}`)
                    .join(', ')}
            </p>
        </section>
    );
}

function RecordsTable({ records }: Pick<Props, 'records'>) {
    return (
        <section className="overflow-hidden rounded-xl border border-brand-border bg-white">
            <div className="flex items-center justify-between p-5">
                <div>
                    <h2 className="font-bold">Filtered PAP records</h2>
                    <p className="text-sm text-brand-muted">
                        {records.total} unique PAP records
                    </p>
                </div>
                {records.total === 0 && (
                    <AlertTriangle className="size-5 text-amber-700" />
                )}
            </div>
            {records.data.length === 0 ? (
                <p className="border-t border-brand-border p-8 text-center text-sm text-brand-muted">
                    No records match the current filters.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="bg-brand-soft">
                            <tr>
                                <th className="p-3">PAP</th>
                                <th className="p-3">Fiscal year</th>
                                <th className="p-3">Decision</th>
                                <th className="p-3 text-right">Requested</th>
                                <th className="p-3 text-right">Approved</th>
                                <th className="p-3 text-right">
                                    GAD attributed
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.data.map((pap) => (
                                <tr
                                    key={pap.id}
                                    className="border-t border-brand-border"
                                >
                                    <td className="p-3">
                                        <Link
                                            href={`/organization-admin/approved-paps/${pap.id}`}
                                            className="font-semibold text-brand-purple"
                                        >
                                            {pap.reference}
                                        </Link>
                                        <p className="mt-1 max-w-md break-words text-brand-muted">
                                            {pap.title}
                                        </p>
                                    </td>
                                    <td className="p-3">{pap.fiscal_year}</td>
                                    <td className="p-3">
                                        {pap.decision
                                            ? label(pap.decision.status)
                                            : 'Data unavailable'}
                                    </td>
                                    <td className="p-3 text-right tabular-nums">
                                        {money(
                                            pap.financial_summary
                                                ?.requested_amount,
                                        )}
                                    </td>
                                    <td className="p-3 text-right tabular-nums">
                                        {money(
                                            pap.financial_summary
                                                ?.approved_amount,
                                        )}
                                    </td>
                                    <td className="p-3 text-right tabular-nums">
                                        {money(
                                            pap.financial_summary
                                                ?.gad_attributed_amount,
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="flex justify-between border-t border-brand-border p-4 text-sm">
                <span>
                    Page {records.current_page} of {records.last_page}
                </span>
                <div className="flex gap-2">
                    {records.prev_page_url && (
                        <Link
                            href={records.prev_page_url}
                            className="rounded border border-brand-border px-3 py-2"
                        >
                            Previous
                        </Link>
                    )}
                    {records.next_page_url && (
                        <Link
                            href={records.next_page_url}
                            className="rounded border border-brand-border px-3 py-2"
                        >
                            Next
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
