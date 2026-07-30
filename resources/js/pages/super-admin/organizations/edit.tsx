import { Head } from '@inertiajs/react';
import OrganizationForm from './form';
export default function Edit(props: Parameters<typeof OrganizationForm>[0]) {
    return (
        <>
            <Head title="Edit organization" />
            <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
                <h1 className="text-2xl font-bold">Edit organization</h1>
                <p className="mb-6 text-brand-muted">
                    Update identity, hierarchy, and readiness evidence.
                </p>
                <OrganizationForm {...props} />
            </div>
        </>
    );
}
