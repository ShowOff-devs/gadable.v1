import { Head, useForm } from '@inertiajs/react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Spinner } from '@/components/ui/spinner';
import { authenticate } from '@/routes/super-admin';

type LoginForm = {
    email: string;
    password: string;
};

const focusClassName =
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-purple/30 focus-visible:ring-offset-2';

export default function SuperAdminLogin() {
    const errorSummaryRef = useRef<HTMLDivElement>(null);
    const { data, setData, post, processing, errors, reset } =
        useForm<LoginForm>({
            email: '',
            password: '',
        });
    const authenticationError = errors.email || errors.password;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        post(authenticate().url, {
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
            <Head title="Super Admin Sign In | GADable">
                <meta name="robots" content="noindex, nofollow, noarchive" />
                <meta name="referrer" content="no-referrer" />
            </Head>

            <a
                href="#super-admin-sign-in"
                className={`fixed top-3 left-3 z-50 -translate-y-24 rounded-md bg-brand-deep px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0 motion-reduce:transition-none ${focusClassName}`}
            >
                Skip to sign-in form
            </a>

            <div className="flex min-h-svh flex-col bg-brand-soft text-brand-text">
                <main
                    id="main-content"
                    className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12"
                >
                    <section
                        className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-[0_18px_50px_rgba(76,7,94,0.08)] sm:p-9"
                        aria-labelledby="super-admin-heading"
                    >
                        <header className="text-center">
                            <img
                                src="/images/gadable-logo-icon.png"
                                alt="GADable"
                                className="mx-auto size-16 object-contain"
                            />
                            <p className="mt-5 text-xs font-bold tracking-[0.16em] text-brand-magenta uppercase">
                                Restricted Administrative Portal
                            </p>
                            <h1
                                id="super-admin-heading"
                                className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
                            >
                                Super Admin Sign In
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-brand-muted">
                                Sign in to manage the GADable platform,
                                organizations, subscriptions, security, and
                                system-wide settings.
                            </p>
                        </header>

                        <div
                            ref={errorSummaryRef}
                            tabIndex={authenticationError ? -1 : undefined}
                            role={authenticationError ? 'alert' : undefined}
                            aria-live="polite"
                            className={
                                authenticationError
                                    ? 'mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 outline-none focus:ring-3 focus:ring-red-200'
                                    : 'sr-only'
                            }
                        >
                            {authenticationError}
                        </div>

                        <form
                            id="super-admin-sign-in"
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
                                    name="email"
                                    type="email"
                                    autoComplete="username"
                                    autoFocus
                                    required
                                    value={data.email}
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={
                                        errors.email ? 'email-error' : undefined
                                    }
                                    className={`min-h-12 rounded-lg border border-brand-border bg-white px-3.5 text-base text-brand-text shadow-sm placeholder:text-brand-muted/70 ${focusClassName}`}
                                />
                                <InputError
                                    id="email-error"
                                    message={
                                        errors.email === authenticationError
                                            ? undefined
                                            : errors.email
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-semibold"
                                >
                                    Password
                                </label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    autoComplete="current-password"
                                    required
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
                                    className="min-h-12 border-brand-border pr-32 text-base focus-visible:ring-brand-purple/30"
                                    showTextLabel
                                />
                                <InputError
                                    id="password-error"
                                    message={
                                        errors.password === authenticationError
                                            ? undefined
                                            : errors.password
                                    }
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                aria-busy={processing}
                                className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-deep px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-purple disabled:cursor-not-allowed disabled:opacity-65 motion-reduce:transition-none ${focusClassName}`}
                            >
                                {processing && <Spinner />}
                                {processing ? 'Verifying…' : 'Sign In Securely'}
                            </button>
                        </form>

                        <aside className="mt-6 rounded-lg border border-brand-border bg-brand-soft p-4">
                            <div className="flex gap-3">
                                <ShieldCheck
                                    className="mt-0.5 size-5 shrink-0 text-brand-purple"
                                    aria-hidden="true"
                                />
                                <p className="text-xs leading-5 text-brand-muted">
                                    This portal is restricted to authorized
                                    GADable Super Administrators. Authentication
                                    attempts may be recorded for security and
                                    audit purposes.
                                </p>
                            </div>
                        </aside>

                        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-brand-muted">
                            <LockKeyhole
                                className="size-4"
                                aria-hidden="true"
                            />
                            Do not continue if you are not authorized.
                        </div>
                    </section>
                </main>

                <footer className="px-4 py-6 text-center text-xs text-brand-muted">
                    © {new Date().getFullYear()} GADable
                </footer>
            </div>
        </>
    );
}
