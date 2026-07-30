import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { home } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

const focusClassName =
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-purple/30 focus-visible:ring-offset-2';

export default function Login({ status, canResetPassword }: Props) {
    const errorSummaryRef = useRef<HTMLDivElement>(null);
    const { data, setData, post, processing, errors, reset } =
        useForm<LoginForm>({
            email: '',
            password: '',
            remember: false,
        });
    const hasAuthenticationError = Boolean(errors.email || errors.password);

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
            <Head title="User Sign In">
                <meta
                    name="description"
                    content="Sign in to the GADable User Portal for authorized proponents, evaluators, and approvers."
                />
            </Head>

            <a
                href="#sign-in-form"
                className={`fixed top-3 left-3 z-50 -translate-y-24 rounded-md bg-brand-deep px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0 ${focusClassName}`}
            >
                Skip to sign-in form
            </a>

            <div className="flex min-h-svh flex-col bg-brand-soft text-brand-text">
                <header className="border-b border-brand-border bg-white">
                    <div className="mx-auto flex min-h-18 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
                        <Link
                            href={home()}
                            className={`inline-flex items-center gap-3 rounded-md ${focusClassName}`}
                            aria-label="GADable home"
                        >
                            <img
                                src="/images/gadable-logo-icon.png"
                                alt=""
                                className="size-11 object-contain"
                            />
                            <span className="text-lg font-semibold tracking-tight">
                                GADable
                            </span>
                        </Link>
                        <Link
                            href={home()}
                            className={`inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-brand-muted transition-colors hover:text-brand-purple ${focusClassName}`}
                        >
                            <ArrowLeft className="size-4" aria-hidden="true" />
                            Back to Home
                        </Link>
                    </div>
                </header>

                <main className="flex flex-1 items-center py-10 sm:py-14 lg:py-16">
                    <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
                        <section className="hidden max-w-md lg:block">
                            <p className="text-sm font-semibold tracking-[0.16em] text-brand-magenta uppercase">
                                Controlled access
                            </p>
                            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                                Your assigned workspace, responsibilities, and
                                records in one place.
                            </h2>
                            <p className="mt-4 text-base leading-7 text-brand-muted">
                                GADable supports structured and accountable work
                                across the PAP lifecycle while keeping access
                                aligned with assigned roles.
                            </p>
                            <div className="mt-8 grid gap-4">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck
                                        className="mt-0.5 size-5 shrink-0 text-brand-purple"
                                        aria-hidden="true"
                                    />
                                    <p className="text-sm leading-6 text-brand-muted">
                                        Access is determined by your account’s
                                        server-side role assignments.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <LockKeyhole
                                        className="mt-0.5 size-5 shrink-0 text-brand-purple"
                                        aria-hidden="true"
                                    />
                                    <p className="text-sm leading-6 text-brand-muted">
                                        Use only your assigned account and never
                                        share your password.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section
                            id="sign-in-form"
                            className="mx-auto w-full max-w-xl rounded-xl border border-brand-border bg-white p-5 shadow-sm sm:p-8"
                            aria-labelledby="sign-in-heading"
                        >
                            <div className="border-b border-brand-border pb-6">
                                <p className="text-sm font-semibold tracking-[0.14em] text-brand-magenta uppercase">
                                    GADable User Portal
                                </p>
                                <h1
                                    id="sign-in-heading"
                                    className="mt-3 text-3xl font-semibold tracking-tight"
                                >
                                    Sign in to your account
                                </h1>
                                <p className="mt-3 text-sm leading-6 text-brand-muted sm:text-base">
                                    Access your assigned GADable workspace to
                                    submit, evaluate, review, or approve Gender
                                    and Development Programs, Activities, and
                                    Projects.
                                </p>
                                <p className="mt-3 rounded-md border border-brand-border bg-brand-soft px-4 py-3 text-sm leading-6 text-brand-muted">
                                    This portal is for authorized proponents,
                                    evaluators, and approvers.
                                </p>
                            </div>

                            {status && (
                                <div
                                    className="mt-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
                                    role="status"
                                >
                                    {status}
                                </div>
                            )}

                            {hasAuthenticationError && (
                                <div
                                    ref={errorSummaryRef}
                                    className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
                                    role="alert"
                                    tabIndex={-1}
                                >
                                    <p className="font-semibold">
                                        We could not sign you in
                                    </p>
                                    <p>
                                        We could not sign you in with the
                                        provided credentials. Please check your
                                        information and try again.
                                    </p>
                                </div>
                            )}

                            <form
                                onSubmit={submit}
                                className="mt-6 grid gap-5"
                                noValidate
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <input
                                        id="email"
                                        type="email"
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
                                        required
                                        autoFocus
                                        autoComplete="username"
                                        placeholder="name@organization.gov.ph"
                                        aria-invalid={Boolean(errors.email)}
                                        aria-describedby={
                                            errors.email
                                                ? 'email-error'
                                                : undefined
                                        }
                                        className={`h-11 w-full rounded-md border bg-white px-3 text-base text-brand-text shadow-xs transition-[color,box-shadow] outline-none placeholder:text-brand-muted focus-visible:border-brand-purple focus-visible:ring-3 focus-visible:ring-brand-purple/20 sm:text-sm ${
                                            errors.email
                                                ? 'border-red-500'
                                                : 'border-brand-border'
                                        }`}
                                    />
                                    <InputError
                                        id="email-error"
                                        message={errors.email}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <Link
                                                href={request()}
                                                className={`rounded-sm text-sm font-semibold text-brand-purple underline decoration-brand-border underline-offset-4 hover:decoration-brand-purple ${focusClassName}`}
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        value={data.password}
                                        onChange={(event) =>
                                            setData(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                        required
                                        autoComplete="current-password"
                                        aria-invalid={Boolean(errors.password)}
                                        aria-describedby={
                                            errors.password
                                                ? 'password-error'
                                                : undefined
                                        }
                                        className={`h-11 border-brand-border bg-white text-base focus-visible:border-brand-purple focus-visible:ring-brand-purple/20 sm:text-sm ${
                                            errors.password
                                                ? 'border-red-500'
                                                : ''
                                        }`}
                                    />
                                    <InputError
                                        id="password-error"
                                        message={errors.password}
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'remember',
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="font-normal text-brand-muted"
                                    >
                                        Remember me on this device
                                    </Label>
                                </div>

                                <button
                                    type="submit"
                                    className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-purple px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-65 ${focusClassName}`}
                                    disabled={processing}
                                    aria-busy={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner />}
                                    <span>
                                        {processing ? 'Signing in…' : 'Sign In'}
                                    </span>
                                </button>
                            </form>

                            <div className="mt-6">
                                <PasskeyVerify
                                    label="Sign in with a passkey"
                                    loadingLabel="Authenticating…"
                                    separator="Or use a passkey"
                                />
                            </div>

                            <div className="mt-6 grid gap-2 border-t border-brand-border pt-6 text-sm leading-6 text-brand-muted">
                                <p>
                                    Having trouble signing in? Contact your
                                    organization’s GADable administrator.
                                </p>
                                <p>
                                    For your protection, use only your assigned
                                    account and do not share your password.
                                </p>
                            </div>
                        </section>
                    </div>
                </main>

                <footer className="border-t border-brand-border bg-white">
                    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-6 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                        <div>
                            <p className="font-semibold text-brand-text">
                                GADable
                            </p>
                            <p className="mt-1 text-xs">
                                Accountable GAD planning, evaluation,
                                monitoring, and reporting.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
                            {[
                                'Privacy (coming soon)',
                                'Terms (coming soon)',
                                'Accessibility (coming soon)',
                                'Help Center (coming soon)',
                            ].map((item) => (
                                <span key={item}>{item}</span>
                            ))}
                        </div>
                        <p className="text-xs">
                            © {new Date().getFullYear()} GADable
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
