import { Form, Head, Link } from '@inertiajs/react';

type Amendment = {
    id: number;
    reason: string;
    authority_reference: string;
    effective_date: string;
    created_at: string;
};
type Summary = {
    approved_amount: string | null;
    requested_amount: string | null;
    gad_attributed_amount: string | null;
    gad_classification: string;
    attribution_method: string;
    financial_status: string;
    lock_version: number;
    official_reference: string | null;
    amendments: Amendment[];
};
type Props = {
    pap: {
        id: number;
        reference: string;
        title: string;
        fiscal_year: number;
        workflow_status: string;
        requested_amount: string | null;
        total_pap_cost: string | null;
        funding_source: string | null;
        decision: {
            status: string;
            decision_date: string;
            decision_reference: string | null;
            basis: string | null;
            conditions: string[] | null;
        };
        financial_summary: Summary | null;
    };
};
const money = (value: string | null) =>
    value == null
        ? 'Not available'
        : new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
          }).format(Number(value));
const input = 'min-h-11 w-full rounded-lg border border-brand-border px-3';

export default function ApprovedPapShow({ pap }: Props) {
    const summary = pap.financial_summary;

    return (
        <>
            <Head title={`${pap.reference} — Approved PAP`} />
            <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
                <Link
                    href="/organization-admin/approved-paps"
                    className="text-sm font-semibold text-brand-purple"
                >
                    ← Approved PAP registry
                </Link>
                <header>
                    <p className="text-sm font-semibold text-brand-purple">
                        {pap.reference}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold">{pap.title}</h1>
                    <p className="mt-2 text-sm text-brand-muted">
                        Fiscal year {pap.fiscal_year} ·{' '}
                        {pap.workflow_status.replaceAll('_', ' ')}
                    </p>
                </header>
                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-xl border border-brand-border bg-white p-5">
                        <h2 className="font-bold">Authoritative decision</h2>
                        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-brand-muted">Decision</dt>
                                <dd className="mt-1 font-semibold capitalize">
                                    {pap.decision.status.replaceAll('_', ' ')}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">
                                    Decision date
                                </dt>
                                <dd className="mt-1 font-semibold">
                                    {pap.decision.decision_date}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">
                                    Official reference
                                </dt>
                                <dd className="mt-1">
                                    {pap.decision.decision_reference ??
                                        'Not available'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">Basis</dt>
                                <dd className="mt-1">
                                    {pap.decision.basis ?? 'Not available'}
                                </dd>
                            </div>
                        </dl>
                    </section>
                    <section className="rounded-xl border border-brand-border bg-white p-5">
                        <h2 className="font-bold">PAP financial context</h2>
                        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-brand-muted">Requested</dt>
                                <dd className="mt-1 font-semibold">
                                    {money(pap.requested_amount)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">
                                    Total PAP cost
                                </dt>
                                <dd className="mt-1 font-semibold">
                                    {money(pap.total_pap_cost)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-brand-muted">
                                    Funding source
                                </dt>
                                <dd className="mt-1">
                                    {pap.funding_source ?? 'Not available'}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>
                {!summary ? (
                    <section className="rounded-xl border border-brand-border bg-white p-5">
                        <h2 className="font-bold">Record financial summary</h2>
                        <p className="mt-1 text-sm text-brand-muted">
                            Leave unavailable values blank. The system never
                            substitutes zero for missing financial data.
                        </p>
                        <Form
                            action={`/organization-admin/approved-paps/${pap.id}/financial-summary`}
                            method="post"
                            className="mt-5 grid gap-4 sm:grid-cols-2"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <input
                                        type="hidden"
                                        name="currency"
                                        value="PHP"
                                    />
                                    <label className="text-sm">
                                        Fiscal year
                                        <input
                                            name="fiscal_year"
                                            type="number"
                                            defaultValue={pap.fiscal_year}
                                            required
                                            className={input}
                                        />
                                    </label>
                                    <label className="text-sm">
                                        Approval date
                                        <input
                                            name="approval_date"
                                            type="date"
                                            defaultValue={pap.decision.decision_date.slice(
                                                0,
                                                10,
                                            )}
                                            required
                                            className={input}
                                        />
                                    </label>
                                    <label className="text-sm">
                                        Requested amount
                                        <input
                                            name="requested_amount"
                                            inputMode="decimal"
                                            defaultValue={
                                                pap.requested_amount ?? ''
                                            }
                                            className={input}
                                        />
                                    </label>
                                    <label className="text-sm">
                                        Approved amount
                                        <input
                                            name="approved_amount"
                                            inputMode="decimal"
                                            className={input}
                                        />
                                    </label>
                                    <label className="text-sm">
                                        GAD classification
                                        <select
                                            name="gad_classification"
                                            required
                                            className={input}
                                        >
                                            <option value="not_yet_classified">
                                                Not yet classified
                                            </option>
                                            <option value="direct_gad">
                                                Direct GAD
                                            </option>
                                            <option value="attributable_regular_program">
                                                Attributable regular program
                                            </option>
                                        </select>
                                    </label>
                                    <label className="text-sm">
                                        Attribution method
                                        <select
                                            name="attribution_method"
                                            required
                                            className={input}
                                        >
                                            <option value="not_yet_available">
                                                Not yet available
                                            </option>
                                            <option value="not_applicable">
                                                Not applicable
                                            </option>
                                            <option value="direct_amount">
                                                Direct amount
                                            </option>
                                            <option value="percentage_based">
                                                Percentage based
                                            </option>
                                        </select>
                                    </label>
                                    <label className="text-sm">
                                        Attribution base amount
                                        <input
                                            name="attribution_base_amount"
                                            inputMode="decimal"
                                            className={input}
                                        />
                                    </label>
                                    <label className="text-sm">
                                        Attribution percentage
                                        <input
                                            name="attribution_percentage"
                                            inputMode="decimal"
                                            className={input}
                                        />
                                    </label>
                                    <label className="text-sm">
                                        Direct attributed amount
                                        <input
                                            name="gad_attributed_amount"
                                            inputMode="decimal"
                                            className={input}
                                        />
                                    </label>
                                    <label className="text-sm">
                                        Financial status
                                        <select
                                            name="financial_status"
                                            defaultValue="approved"
                                            required
                                            className={input}
                                        >
                                            <option value="approved">
                                                Approved
                                            </option>
                                            <option value="partially_approved">
                                                Partially approved
                                            </option>
                                            <option value="under_review">
                                                Under review
                                            </option>
                                            <option value="completed">
                                                Completed
                                            </option>
                                        </select>
                                    </label>
                                    <label className="text-sm sm:col-span-2">
                                        Official financial reference
                                        <input
                                            name="official_reference"
                                            className={input}
                                        />
                                    </label>
                                    {Object.keys(errors).length > 0 && (
                                        <p className="text-sm text-red-700 sm:col-span-2">
                                            {Object.values(errors)[0]}
                                        </p>
                                    )}
                                    <button
                                        disabled={processing}
                                        className="min-h-11 rounded-lg bg-brand-purple px-5 font-semibold text-white sm:col-span-2"
                                    >
                                        {processing
                                            ? 'Saving…'
                                            : 'Record summary'}
                                    </button>
                                </>
                            )}
                        </Form>
                    </section>
                ) : (
                    <>
                        <section className="rounded-xl border border-brand-border bg-white p-5">
                            <h2 className="font-bold">Financial summary</h2>
                            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                                <div>
                                    <dt className="text-brand-muted">
                                        Requested
                                    </dt>
                                    <dd className="mt-1 font-semibold">
                                        {money(summary.requested_amount)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-brand-muted">
                                        Approved
                                    </dt>
                                    <dd className="mt-1 font-semibold">
                                        {money(summary.approved_amount)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-brand-muted">
                                        GAD attributed
                                    </dt>
                                    <dd className="mt-1 font-semibold">
                                        {money(summary.gad_attributed_amount)}
                                    </dd>
                                </div>
                            </dl>
                        </section>
                        <section className="rounded-xl border border-brand-border bg-white p-5">
                            <h2 className="font-bold">Record amendment</h2>
                            <p className="mt-1 text-sm text-brand-muted">
                                Corrections are append-only and require an
                                authority reference and attestation.
                            </p>
                            <Form
                                action={`/organization-admin/approved-paps/${pap.id}/financial-summary/amendments`}
                                method="post"
                                className="mt-4 grid gap-4 sm:grid-cols-2"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <input
                                            type="hidden"
                                            name="lock_version"
                                            value={summary.lock_version}
                                        />
                                        <label className="text-sm">
                                            Revised approved amount
                                            <input
                                                name="changes[approved_amount]"
                                                inputMode="decimal"
                                                defaultValue={
                                                    summary.approved_amount ??
                                                    ''
                                                }
                                                className={input}
                                            />
                                        </label>
                                        <label className="text-sm">
                                            Effective date
                                            <input
                                                name="effective_date"
                                                type="date"
                                                required
                                                className={input}
                                            />
                                        </label>
                                        <label className="text-sm">
                                            Authority reference
                                            <input
                                                name="authority_reference"
                                                required
                                                className={input}
                                            />
                                        </label>
                                        <label className="text-sm">
                                            Reason
                                            <input
                                                name="reason"
                                                minLength={10}
                                                required
                                                className={input}
                                            />
                                        </label>
                                        <label className="flex items-center gap-2 text-sm sm:col-span-2">
                                            <input
                                                type="checkbox"
                                                name="attested"
                                                value="1"
                                                required
                                            />{' '}
                                            I attest this correction is
                                            supported by the stated authority.
                                        </label>
                                        {Object.keys(errors).length > 0 && (
                                            <p className="text-sm text-red-700 sm:col-span-2">
                                                {Object.values(errors)[0]}
                                            </p>
                                        )}
                                        <button
                                            disabled={processing}
                                            className="min-h-11 rounded-lg bg-brand-purple px-5 font-semibold text-white sm:col-span-2"
                                        >
                                            Record amendment
                                        </button>
                                    </>
                                )}
                            </Form>
                        </section>
                        {summary.amendments.length > 0 && (
                            <section className="rounded-xl border border-brand-border bg-white p-5">
                                <h2 className="font-bold">Amendment history</h2>
                                <ul className="mt-4 divide-y divide-brand-border">
                                    {summary.amendments.map((a) => (
                                        <li key={a.id} className="py-3 text-sm">
                                            <p className="font-semibold">
                                                {a.authority_reference} ·{' '}
                                                {a.effective_date}
                                            </p>
                                            <p className="mt-1 text-brand-muted">
                                                {a.reason}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
