import { Head } from '@inertiajs/react';
import OrganizationForm from './form';
export default function Create(props: Parameters<typeof OrganizationForm>[0]) {
    return (
        <>
            <Head title="Register organization" />
            <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
                <h1 className="text-2xl font-bold">Register organization</h1>
                <p className="mb-6 text-brand-muted">
                    Create a draft organization governance record.
                </p>
                <OrganizationForm {...props} />
            </div>
        </>
    );
}
