import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/organization-admin/login';
import { request } from '@/routes/password';

type Props = { canResetPassword: boolean; status?: string };
type LoginForm = { email: string; password: string };

const focus =
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-purple/30 focus-visible:ring-offset-2';

export default function OrganizationAdminLogin({
    canResetPassword,
    status,
}: Props) {
    const errorSummaryRef = useRef<HTMLDivElement>(null);
    const { data, setData, post, processing, errors, reset } =
        useForm<LoginForm>({ email: '', password: '' });
    const authenticationError = errors.email || errors.password;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(store().url, {
            preserveScroll: true,
            onError: () => {
                reset('password');
                requestAnimationFrame(() => errorSummaryRef.current?.focus());
            },
            onFinish: () => reset('password'),
        });
    }

    return (
        <>
            <Head title="Organization Admin Portal | GADable">
                <meta name="robots" content="noindex, nofollow, noarchive" />
                <meta name="referrer" content="no-referrer" />
            </Head>
            <a
                href="#organization-admin-sign-in"
                className={`fixed top-3 left-3 z-50 -translate-y-24 rounded-md bg-brand-deep px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0 motion-reduce:transition-none ${focus}`}
            >
                Skip to sign-in form
            </a>

            <main className="min-h-svh bg-brand-soft text-brand-text lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
                <section className="hidden bg-brand-deep px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/gadable-logo-icon.png"
                            alt=""
                            className="size-14 object-contain"
                        />
                        <span className="text-2xl font-semibold tracking-tight">
                            GADable
                        </span>
                    </div>
                    <div className="max-w-xl">
                        <p className="text-sm font-bold tracking-[0.16em] text-fuchsia-200 uppercase">
                            Authorized organization access
                        </p>
                        <h2 className="mt-5 text-4xl leading-tight font-semibold">
                            Secure administration for your organization
                            workspace
                        </h2>
                        <p className="mt-5 max-w-lg text-base leading-7 text-purple-100">
                            Manage only the organization and units covered by
                            your current documented authority.
                        </p>
                        <div className="mt-9 grid gap-4">
                            <p className="flex items-start gap-3">
                                <Building2
                                    className="mt-0.5 size-5 shrink-0"
                                    aria-hidden
                                />
                                Organization-scoped access is checked on every
                                request.
                            </p>
                            <p className="flex items-start gap-3">
                                <ShieldCheck
                                    className="mt-0.5 size-5 shrink-0"
                                    aria-hidden
                                />
                                Multi-factor verification protects privileged
                                sessions.
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-purple-100">
                        Administration does not grant PAP evaluation or approval
                        authority.
                    </p>
                </section>

                <section className="flex min-h-svh items-center px-4 py-8 sm:px-8 lg:px-12">
                    <div
                        id="organization-admin-sign-in"
                        className="mx-auto w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-[0_18px_50px_rgba(76,7,94,0.08)] sm:p-9"
                    >
                        <header>
                            <img
                                src="/images/gadable-logo-icon.png"
                                alt="GADable"
                                className="size-14 object-contain lg:hidden"
                            />
                            <p className="mt-5 text-xs font-bold tracking-[0.16em] text-brand-magenta uppercase">
                                Privileged tenant access
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                                Organization Admin Portal
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-brand-muted">
                                Sign in with your authorized Organization
                                Administrator account.
                            </p>
                        </header>

                        {status && (
                            <div
                                className="mt-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
                                role="status"
                            >
                                {status}
                            </div>
                        )}
                        {authenticationError && (
                            <div
                                ref={errorSummaryRef}
                                tabIndex={-1}
                                role="alert"
                                className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
                            >
                                <p className="font-semibold">
                                    We could not sign you in
                                </p>
                                <p>
                                    Check your details or contact your
                                    authorized administrator.
                                </p>
                            </div>
                        )}

                        <form
                            onSubmit={submit}
                            className="mt-7 grid gap-5"
                            noValidate
                        >
                            <div className="grid gap-2">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-semibold"
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    autoComplete="username"
                                    value={data.email}
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                    onBlur={() =>
                                        setData(
                                            'email',
                                            data.email.trim().toLowerCase(),
                                        )
                                    }
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={
                                        errors.email ? 'email-error' : undefined
                                    }
                                    className="min-h-12 w-full rounded-lg border border-brand-border px-3.5 text-base outline-none focus-visible:border-brand-purple focus-visible:ring-3 focus-visible:ring-brand-purple/20"
                                />
                                <InputError
                                    id="email-error"
                                    message={errors.email}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-3">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-semibold"
                                    >
                                        Password
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={request()}
                                            className={`text-sm font-semibold text-brand-purple underline underline-offset-4 ${focus}`}
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    required
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(event) =>
                                        setData('password', event.target.value)
                                    }
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={
                                        errors.password
                                            ? 'password-error'
                                            : undefined
                                    }
                                    className="min-h-12 border-brand-border text-base focus-visible:border-brand-purple focus-visible:ring-brand-purple/20"
                                />
                                <InputError
                                    id="password-error"
                                    message={errors.password}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                aria-busy={processing}
                                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-purple px-5 py-3 text-sm font-semibold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-65 ${focus}`}
                            >
                                {processing && <Spinner />}
                                <span>
                                    {processing
                                        ? 'Signing in…'
                                        : 'Sign In Securely'}
                                </span>
                            </button>
                        </form>

                        <div className="mt-7 border-t border-brand-border pt-5 text-sm leading-6 text-brand-muted">
                            <p>Not an Organization Administrator?</p>
                            <Link
                                href="/login"
                                className={`font-semibold text-brand-purple underline underline-offset-4 ${focus}`}
                            >
                                Go to User Sign In
                            </Link>
                            <p className="mt-3">
                                Platform administrators use the separate Super
                                Admin portal.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
