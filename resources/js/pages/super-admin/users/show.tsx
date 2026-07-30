import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    CalendarClock,
    KeyRound,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import { index } from '@/routes/super-admin/users';
import type { UserAccessDetail } from '@/types/user-access';

const label = (value: string) =>
    value
        .replaceAll('.', ' ')
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
const dateTime = (value: string | null) =>
    value
        ? new Intl.DateTimeFormat('en-PH', {
              dateStyle: 'medium',
              timeStyle: 'short',
          }).format(new Date(value))
        : 'Unavailable';

function Unavailable({ children }: { children: string }) {
    return (
        <div className="rounded-lg border border-dashed p-4 text-sm text-brand-muted">
            {children} is not configured in the authoritative backend.
        </div>
    );
}

export default function Show({
    user,
    availability,
}: {
    user: UserAccessDetail;
    availability: Record<string, boolean>;
}) {
    return (
        <>
            <Head title={user.name} />
            <div className="p-4 sm:p-6 lg:p-8">
                <header className="mb-6">
                    <Link
                        href={index().url}
                        className="text-sm font-semibold text-brand-purple hover:underline"
                    >
                        ← User & Access
                    </Link>
                    <div className="mt-4 flex min-w-0 items-center gap-4">
                        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-purple text-xl font-bold text-white">
                            {user.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold break-words">
                                {user.name}
                            </h1>
                            <p className="break-all text-brand-muted">
                                {user.email}
                            </p>
                            <p className="text-sm text-brand-muted">
                                {user.reference}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="space-y-6">
                        <section className="rounded-xl border bg-white p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <UserRound
                                    className="size-5 text-brand-purple"
                                    aria-hidden="true"
                                />
                                <h2 className="font-semibold">
                                    Account overview
                                </h2>
                            </div>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                {[
                                    [
                                        'Account category',
                                        label(user.accountType),
                                    ],
                                    [
                                        'Account status',
                                        label(user.accountStatus),
                                    ],
                                    [
                                        'Verification',
                                        label(user.verificationStatus),
                                    ],
                                    ['MFA enrollment', label(user.mfaStatus)],
                                    ['Created', dateTime(user.createdAt)],
                                    [
                                        'Last confirmed login',
                                        dateTime(user.lastLoginAt),
                                    ],
                                ].map(([term, description]) => (
                                    <div key={term}>
                                        <dt className="text-xs font-semibold tracking-wide text-brand-muted uppercase">
                                            {term}
                                        </dt>
                                        <dd className="mt-1">{description}</dd>
                                    </div>
                                ))}
                            </dl>
                        </section>

                        <section className="rounded-xl border bg-white p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <Building2
                                    className="size-5 text-brand-purple"
                                    aria-hidden="true"
                                />
                                <h2 className="font-semibold">
                                    Organization memberships
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {user.memberships.map((membership) => (
                                    <article
                                        key={membership.id}
                                        className="rounded-lg border p-4"
                                    >
                                        <h3 className="font-semibold break-words">
                                            {membership.organization.name}
                                        </h3>
                                        <p className="text-sm text-brand-muted">
                                            {membership.organization.code} ·
                                            Organization{' '}
                                            {label(
                                                membership.organization.status,
                                            )}
                                        </p>
                                        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                                            <div>
                                                <dt className="text-xs text-brand-muted">
                                                    Membership
                                                </dt>
                                                <dd>
                                                    {label(membership.status)}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-brand-muted">
                                                    Effective
                                                </dt>
                                                <dd>
                                                    {dateTime(
                                                        membership.startedAt,
                                                    )}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-brand-muted">
                                                    Ended
                                                </dt>
                                                <dd>
                                                    {dateTime(
                                                        membership.endedAt,
                                                    )}
                                                </dd>
                                            </div>
                                        </dl>
                                        <div className="mt-4 space-y-2">
                                            <h4 className="text-sm font-semibold">
                                                Designations
                                            </h4>
                                            {membership.designations.length ? (
                                                membership.designations.map(
                                                    (designation) => (
                                                        <div
                                                            key={designation.id}
                                                            className="rounded-md bg-brand-soft p-3 text-sm"
                                                        >
                                                            <p className="font-medium">
                                                                {label(
                                                                    designation.type,
                                                                )}{' '}
                                                                ·{' '}
                                                                {label(
                                                                    designation.status,
                                                                )}
                                                            </p>
                                                            <p className="text-brand-muted">
                                                                Effective{' '}
                                                                {dateTime(
                                                                    designation.effectiveAt,
                                                                )}
                                                                {' · Expires '}
                                                                {dateTime(
                                                                    designation.expiresAt,
                                                                )}
                                                            </p>
                                                            <p className="text-brand-muted">
                                                                Authority
                                                                documented:{' '}
                                                                {designation.authorityDocumented
                                                                    ? 'Yes'
                                                                    : 'No'}
                                                            </p>
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <p className="text-sm text-brand-muted">
                                                    No designation record.
                                                </p>
                                            )}
                                        </div>
                                    </article>
                                ))}
                                {user.memberships.length === 0 && (
                                    <p className="text-sm text-brand-muted">
                                        No organization membership record.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-xl border bg-white p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <ShieldCheck
                                    className="size-5 text-brand-purple"
                                    aria-hidden="true"
                                />
                                <h2 className="font-semibold">
                                    Access and security history
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {user.activity.map((event) => (
                                    <article
                                        key={event.id}
                                        className="border-l-2 border-brand-border pl-4"
                                    >
                                        <p className="font-medium">
                                            {label(event.type)}
                                        </p>
                                        <p className="text-sm text-brand-muted">
                                            {label(event.outcome)} ·{' '}
                                            {dateTime(event.occurredAt)}
                                        </p>
                                    </article>
                                ))}
                                {user.activity.length === 0 && (
                                    <p className="text-sm text-brand-muted">
                                        No summarized security activity is
                                        available.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <section className="rounded-xl border bg-white p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <KeyRound
                                    className="size-5 text-brand-purple"
                                    aria-hidden="true"
                                />
                                <h2 className="font-semibold">
                                    Sessions and security
                                </h2>
                            </div>
                            <p className="mb-3 text-sm text-brand-muted">
                                {user.activeSessions} confirmed active{' '}
                                {user.activeSessions === 1
                                    ? 'session'
                                    : 'sessions'}
                            </p>
                            <div className="space-y-3">
                                {user.sessions.map((session, position) => (
                                    <article
                                        key={`${session.lastActivityAt}-${position}`}
                                        className="rounded-lg border p-3 text-sm"
                                    >
                                        <p className="font-medium">
                                            {session.deviceSummary}
                                            {session.current
                                                ? ' · Current session'
                                                : ''}
                                        </p>
                                        <p className="text-brand-muted">
                                            Last activity{' '}
                                            {dateTime(session.lastActivityAt)}
                                        </p>
                                    </article>
                                ))}
                                {user.sessions.length === 0 && (
                                    <p className="text-sm text-brand-muted">
                                        No active sessions.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-xl border bg-white p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <CalendarClock
                                    className="size-5 text-brand-purple"
                                    aria-hidden="true"
                                />
                                <h2 className="font-semibold">
                                    Access capabilities
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {!availability.roleAssignments && (
                                    <Unavailable>
                                        Role-assignment records
                                    </Unavailable>
                                )}
                                {!availability.qualifications && (
                                    <Unavailable>
                                        Evaluator qualifications
                                    </Unavailable>
                                )}
                                {!availability.assignments && (
                                    <Unavailable>
                                        High-level PAP assignments
                                    </Unavailable>
                                )}
                                {!availability.duplicateCases && (
                                    <Unavailable>
                                        Duplicate-account reviews
                                    </Unavailable>
                                )}
                                {!availability.transferCases && (
                                    <Unavailable>
                                        Organization-transfer reviews
                                    </Unavailable>
                                )}
                            </div>
                        </section>

                        {!availability.securityActions && (
                            <section className="rounded-xl border border-amber-300 bg-amber-50 p-5">
                                <h2 className="font-semibold text-amber-950">
                                    Security actions unavailable
                                </h2>
                                <p className="mt-2 text-sm text-amber-900">
                                    Suspension, session revocation, password
                                    reset requirements, MFA recovery, archival,
                                    and restoration have no approved backend
                                    workflow. No inactive controls are shown.
                                </p>
                            </section>
                        )}
                    </aside>
                </div>
            </div>
        </>
    );
}
