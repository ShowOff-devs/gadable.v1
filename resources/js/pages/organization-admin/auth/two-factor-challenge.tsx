import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { authenticate } from '@/routes/organization-admin/two-factor';

export default function OrganizationAdminTwoFactorChallenge() {
    const [recovery, setRecovery] = useState(false);
    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm({ code: '', recovery_code: '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(authenticate().url, {
            onFinish: () => reset(recovery ? 'recovery_code' : 'code'),
        });
    }

    return (
        <>
            <Head title="Organization Admin Security Verification | GADable">
                <meta name="robots" content="noindex, nofollow, noarchive" />
                <meta name="referrer" content="no-referrer" />
            </Head>
            <main className="flex min-h-svh items-center justify-center bg-brand-soft px-4 py-8 text-brand-text">
                <section className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-sm sm:p-9">
                    <ShieldCheck
                        className="size-11 text-brand-purple"
                        aria-hidden
                    />
                    <p className="mt-5 text-xs font-bold tracking-[0.16em] text-brand-magenta uppercase">
                        Organization Admin Portal
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold">
                        Security verification
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-brand-muted">
                        {recovery
                            ? 'Enter one of your approved recovery codes.'
                            : 'Enter the code from your authenticator application.'}
                    </p>
                    <form onSubmit={submit} className="mt-7 grid gap-5">
                        <div className="grid gap-2">
                            <label
                                htmlFor={recovery ? 'recovery_code' : 'code'}
                                className="text-sm font-semibold"
                            >
                                {recovery
                                    ? 'Recovery code'
                                    : 'Authentication code'}
                            </label>
                            <input
                                id={recovery ? 'recovery_code' : 'code'}
                                type="text"
                                inputMode={recovery ? undefined : 'numeric'}
                                autoComplete="one-time-code"
                                required
                                autoFocus
                                value={
                                    recovery ? data.recovery_code : data.code
                                }
                                onChange={(event) =>
                                    setData(
                                        recovery ? 'recovery_code' : 'code',
                                        event.target.value,
                                    )
                                }
                                className="min-h-12 rounded-lg border border-brand-border px-3.5 text-base focus-visible:ring-3 focus-visible:ring-brand-purple/30 focus-visible:outline-none"
                            />
                            <InputError
                                message={
                                    recovery
                                        ? errors.recovery_code
                                        : errors.code
                                }
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            aria-busy={processing}
                            className="min-h-12 rounded-lg bg-brand-purple px-5 py-3 text-sm font-semibold text-white focus-visible:ring-3 focus-visible:ring-brand-purple/30 focus-visible:outline-none disabled:opacity-65"
                        >
                            {processing ? 'Verifying…' : 'Verify and Continue'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                clearErrors();
                                reset();
                                setRecovery(!recovery);
                            }}
                            className="min-h-11 text-sm font-semibold text-brand-purple underline underline-offset-4 focus-visible:ring-3 focus-visible:ring-brand-purple/30 focus-visible:outline-none"
                        >
                            {recovery
                                ? 'Use an authentication code'
                                : 'Use a recovery code'}
                        </button>
                    </form>
                </section>
            </main>
        </>
    );
}
