import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { authenticate } from '@/routes/super-admin/two-factor';

type ChallengeForm = {
    code: string;
    recovery_code: string;
};

export default function SuperAdminTwoFactorChallenge() {
    const [usingRecoveryCode, setUsingRecoveryCode] = useState(false);
    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm<ChallengeForm>({ code: '', recovery_code: '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(authenticate().url, {
            onFinish: () => reset(usingRecoveryCode ? 'recovery_code' : 'code'),
        });
    }

    function toggleRecoveryMode() {
        clearErrors();
        reset();
        setUsingRecoveryCode((current) => !current);
    }

    return (
        <>
            <Head title="Security Verification | GADable">
                <meta name="robots" content="noindex, nofollow, noarchive" />
                <meta name="referrer" content="no-referrer" />
            </Head>

            <main className="flex min-h-svh items-center justify-center bg-brand-soft px-4 py-8 text-brand-text sm:px-6">
                <section className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-[0_18px_50px_rgba(76,7,94,0.08)] sm:p-9">
                    <header className="text-center">
                        <ShieldCheck
                            className="mx-auto size-11 text-brand-purple"
                            aria-hidden="true"
                        />
                        <p className="mt-5 text-xs font-bold tracking-[0.16em] text-brand-magenta uppercase">
                            Restricted Administrative Portal
                        </p>
                        <h1 className="mt-3 text-2xl font-semibold">
                            Security verification
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-brand-muted">
                            {usingRecoveryCode
                                ? 'Enter one of your approved recovery codes.'
                                : 'Enter the code from your authenticator application.'}
                        </p>
                    </header>

                    <form onSubmit={submit} className="mt-7 grid gap-5">
                        {usingRecoveryCode ? (
                            <div className="grid gap-2">
                                <label
                                    htmlFor="recovery_code"
                                    className="text-sm font-semibold"
                                >
                                    Recovery code
                                </label>
                                <input
                                    id="recovery_code"
                                    name="recovery_code"
                                    type="text"
                                    autoComplete="one-time-code"
                                    required
                                    autoFocus
                                    value={data.recovery_code}
                                    onChange={(event) =>
                                        setData(
                                            'recovery_code',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(errors.recovery_code)}
                                    className="min-h-12 rounded-lg border border-brand-border px-3.5 text-base focus-visible:ring-3 focus-visible:ring-brand-purple/30 focus-visible:outline-none"
                                />
                                <InputError message={errors.recovery_code} />
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <label
                                    htmlFor="code"
                                    className="text-sm font-semibold"
                                >
                                    Authentication code
                                </label>
                                <input
                                    id="code"
                                    name="code"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                    required
                                    autoFocus
                                    value={data.code}
                                    onChange={(event) =>
                                        setData('code', event.target.value)
                                    }
                                    aria-invalid={Boolean(errors.code)}
                                    className="min-h-12 rounded-lg border border-brand-border px-3.5 text-center text-xl tracking-[0.35em] focus-visible:ring-3 focus-visible:ring-brand-purple/30 focus-visible:outline-none"
                                />
                                <InputError message={errors.code} />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            aria-busy={processing}
                            className="min-h-12 rounded-lg bg-brand-deep px-5 py-3 text-sm font-semibold text-white hover:bg-brand-purple focus-visible:ring-3 focus-visible:ring-brand-purple/30 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-65"
                        >
                            {processing ? 'Verifying…' : 'Verify and Continue'}
                        </button>
                        <button
                            type="button"
                            onClick={toggleRecoveryMode}
                            className="min-h-11 rounded-md text-sm font-semibold text-brand-purple underline underline-offset-4 focus-visible:ring-3 focus-visible:ring-brand-purple/30 focus-visible:outline-none"
                        >
                            {usingRecoveryCode
                                ? 'Use an authentication code'
                                : 'Use a recovery code'}
                        </button>
                    </form>
                </section>
            </main>
        </>
    );
}
