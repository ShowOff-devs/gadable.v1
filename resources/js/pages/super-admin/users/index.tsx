import { Head, Link, router } from '@inertiajs/react';
import {
    KeyRound,
    Search,
    ShieldCheck,
    UserCheck,
    UserRound,
    UsersRound,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { index, show } from '@/routes/super-admin/users';
import type { PaginatedUsers, UserAccessSummary } from '@/types/user-access';

const label = (value: string) =>
    value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
const dateTime = (value: string | null) =>
    value
        ? new Intl.DateTimeFormat('en-PH', {
              dateStyle: 'medium',
              timeStyle: 'short',
          }).format(new Date(value))
        : 'Unavailable';

function Status({ value }: { value: string }) {
    const risk = ['suspended', 'locked', 'pending', 'not_enrolled'].includes(
        value,
    );

    return (
        <span
            className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-semibold ${risk ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-emerald-300 bg-emerald-50 text-emerald-800'}`}
        >
            {label(value)}
        </span>
    );
}

function UserIdentity({ user }: { user: UserAccessSummary }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-purple text-sm font-bold text-white">
                {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
                <Link
                    href={show(user.id).url}
                    className="block font-semibold break-words text-brand-purple hover:underline"
                >
                    {user.name}
                </Link>
                <p className="text-xs break-all text-brand-muted">
                    {user.email}
                </p>
                <p className="text-xs text-brand-muted">{user.reference}</p>
            </div>
        </div>
    );
}

export default function Index({
    users,
    filters,
    filterOptions,
    summary,
    updatedAt,
}: {
    users: PaginatedUsers;
    filters: Record<string, string | undefined>;
    filterOptions: {
        organizations: { id: number; official_name: string }[];
        accountTypes: string[];
        accountStatuses: string[];
    };
    summary: Record<string, number | null>;
    updatedAt: string;
}) {
    const apply = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const values = Object.fromEntries(
            [...new FormData(event.currentTarget).entries()].filter(
                ([, value]) => value !== '',
            ),
        );
        router.get(index().url, values, {
            preserveState: true,
            replace: true,
        });
    };
    const cards = [
        ['total', 'Registered users', UserRound],
        ['active', 'Active accounts', UserCheck],
        ['pendingVerification', 'Pending verification', UsersRound],
        ['suspendedOrLocked', 'Suspended or locked', KeyRound],
        ['privilegedWithoutMfa', 'Privileged without MFA', ShieldCheck],
        ['activeSessions', 'Active sessions', UsersRound],
        ['expiringDesignations', 'Expiring designations', KeyRound],
        ['accessCases', 'Access cases', ShieldCheck],
    ] as const;

    return (
        <>
            <Head title="User & Access" />
            <div className="p-4 sm:p-6 lg:p-8">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">User & Access</h1>
                    <p className="mt-1 max-w-3xl text-brand-muted">
                        Review platform users, organization memberships, account
                        categories, designations, account security, and active
                        access.
                    </p>
                    <p className="mt-2 text-xs text-brand-muted">
                        Updated {dateTime(updatedAt)}
                    </p>
                </header>

                <section
                    aria-label="User access summary"
                    className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {cards.map(([key, title, Icon]) => (
                        <article
                            key={key}
                            className="rounded-xl border bg-white p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm text-brand-muted">
                                        {title}
                                    </p>
                                    <p className="mt-1 text-2xl font-bold">
                                        {summary[key] ?? 'Unavailable'}
                                    </p>
                                </div>
                                <Icon
                                    className="size-5 text-brand-purple"
                                    aria-hidden="true"
                                />
                            </div>
                        </article>
                    ))}
                </section>

                <form
                    onSubmit={apply}
                    className="mb-5 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    <label className="relative sm:col-span-2">
                        <span className="mb-1.5 block text-sm font-semibold">
                            Search users
                        </span>
                        <Search
                            className="absolute bottom-3 left-3 size-4 text-brand-muted"
                            aria-hidden="true"
                        />
                        <input
                            name="search"
                            defaultValue={filters.search}
                            className="h-11 w-full rounded-md border pr-3 pl-9"
                            placeholder="Name or verified email"
                        />
                    </label>
                    {[
                        [
                            'organization',
                            'Organization',
                            filterOptions.organizations.map((item) => [
                                String(item.id),
                                item.official_name,
                            ]),
                        ],
                        [
                            'account_type',
                            'Account category',
                            filterOptions.accountTypes.map((value) => [
                                value,
                                label(value),
                            ]),
                        ],
                        [
                            'status',
                            'Account status',
                            filterOptions.accountStatuses.map((value) => [
                                value,
                                label(value),
                            ]),
                        ],
                        [
                            'verification',
                            'Verification',
                            [
                                ['verified', 'Verified'],
                                ['pending', 'Pending'],
                            ],
                        ],
                        [
                            'mfa',
                            'MFA enrollment',
                            [
                                ['enrolled', 'Enrolled'],
                                ['not_enrolled', 'Not enrolled'],
                            ],
                        ],
                        [
                            'session',
                            'Session status',
                            [
                                ['active', 'Active session'],
                                ['none', 'No active session'],
                            ],
                        ],
                        [
                            'sort',
                            'Sort',
                            [
                                ['name', 'Name A–Z'],
                                ['newest', 'Newest'],
                                ['last_activity', 'Recent activity'],
                            ],
                        ],
                    ].map(([name, title, options]) => (
                        <label key={String(name)}>
                            <span className="mb-1.5 block text-sm font-semibold">
                                {String(title)}
                            </span>
                            <select
                                name={String(name)}
                                defaultValue={filters[String(name)] ?? ''}
                                className="h-11 w-full rounded-md border px-3"
                            >
                                <option value="">All</option>
                                {(options as string[][]).map(
                                    ([value, optionLabel]) => (
                                        <option key={value} value={value}>
                                            {optionLabel}
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>
                    ))}
                    <div className="flex items-end gap-2">
                        <Button type="submit">Apply filters</Button>
                        <Button asChild variant="outline">
                            <Link href={index().url}>Clear</Link>
                        </Button>
                    </div>
                </form>

                <p aria-live="polite" className="mb-3 text-sm text-brand-muted">
                    {users.total} confirmed{' '}
                    {users.total === 1 ? 'user' : 'users'} found.
                </p>
                <section className="overflow-hidden rounded-xl border bg-white">
                    <div className="hidden overflow-x-auto lg:block">
                        <table className="w-full min-w-[62rem] text-sm">
                            <caption className="sr-only">
                                Platform users and confirmed access status
                            </caption>
                            <thead className="bg-brand-soft text-left">
                                <tr>
                                    {[
                                        'User',
                                        'Organizations',
                                        'Account category',
                                        'Account',
                                        'Verification',
                                        'MFA',
                                        'Sessions',
                                        'Last login',
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            scope="col"
                                            className="p-4"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-t align-top"
                                    >
                                        <td className="p-4">
                                            <UserIdentity user={user} />
                                        </td>
                                        <td className="max-w-64 p-4">
                                            {user.organizations.length
                                                ? user.organizations.map(
                                                      (organization) => (
                                                          <div
                                                              key={
                                                                  organization.id
                                                              }
                                                              className="mb-2"
                                                          >
                                                              <p className="font-medium break-words">
                                                                  {
                                                                      organization.name
                                                                  }
                                                              </p>
                                                              <p className="text-xs text-brand-muted">
                                                                  Membership:{' '}
                                                                  {label(
                                                                      organization.membershipStatus,
                                                                  )}
                                                              </p>
                                                          </div>
                                                      ),
                                                  )
                                                : 'No organization membership'}
                                        </td>
                                        <td className="p-4">
                                            {label(user.accountType)}
                                        </td>
                                        <td className="p-4">
                                            <Status
                                                value={user.accountStatus}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <Status
                                                value={user.verificationStatus}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <Status value={user.mfaStatus} />
                                        </td>
                                        <td className="p-4">
                                            {user.activeSessions}
                                        </td>
                                        <td className="p-4">
                                            {dateTime(user.lastLoginAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="grid gap-3 p-3 lg:hidden">
                        {users.data.map((user) => (
                            <article
                                key={user.id}
                                className="rounded-lg border p-4"
                            >
                                <UserIdentity user={user} />
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Status value={user.accountStatus} />
                                    <Status value={user.verificationStatus} />
                                    <Status value={user.mfaStatus} />
                                </div>
                                <p className="mt-3 text-sm">
                                    {user.organizations.length
                                        ? user.organizations
                                              .map((item) => item.name)
                                              .join(', ')
                                        : 'No organization membership'}
                                </p>
                                <p className="mt-1 text-sm text-brand-muted">
                                    {user.activeSessions} active{' '}
                                    {user.activeSessions === 1
                                        ? 'session'
                                        : 'sessions'}
                                </p>
                            </article>
                        ))}
                    </div>
                    {users.data.length === 0 && (
                        <div className="p-12 text-center">
                            <UsersRound className="mx-auto mb-3 size-9 text-brand-muted" />
                            <h2 className="font-semibold">No users found</h2>
                            <p className="mt-1 text-sm text-brand-muted">
                                Clear or adjust the current filters.
                            </p>
                        </div>
                    )}
                </section>
                <nav
                    aria-label="User pagination"
                    className="mt-5 flex flex-wrap gap-2"
                >
                    {users.links.map((link, position) =>
                        link.url ? (
                            <Link
                                key={position}
                                href={link.url}
                                className={`rounded-md border px-3 py-2 text-sm ${link.active ? 'bg-brand-deep text-white' : ''}`}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ) : (
                            <span
                                key={position}
                                className="rounded-md border px-3 py-2 text-sm opacity-50"
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ),
                    )}
                </nav>
            </div>
        </>
    );
}
