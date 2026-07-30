import type { PapWorkflowStatus } from '@/types/proponent-dashboard';

type PapStatusPresentation = {
    label: string;
    className: string;
};

const papStatusPresentations: Record<string, PapStatusPresentation> = {
    draft: {
        label: 'Draft',
        className: 'border-slate-200 bg-slate-50 text-slate-700',
    },
    submitted: {
        label: 'Submitted',
        className: 'border-blue-200 bg-blue-50 text-blue-800',
    },
    under_administrative_screening: {
        label: 'Under Administrative Screening',
        className: 'border-blue-200 bg-blue-50 text-blue-800',
    },
    for_assignment: {
        label: 'For Assignment',
        className: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    },
    assigned: {
        label: 'Assigned',
        className: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    },
    under_evaluation: {
        label: 'Under Evaluation',
        className: 'border-violet-200 bg-violet-50 text-violet-800',
    },
    for_revision: {
        label: 'For Revision',
        className: 'border-amber-300 bg-amber-50 text-amber-900',
    },
    evaluation_completed: {
        label: 'Evaluation Completed',
        className: 'border-cyan-200 bg-cyan-50 text-cyan-900',
    },
    for_final_review: {
        label: 'For Final Review',
        className: 'border-purple-200 bg-purple-50 text-purple-900',
    },
    approved: {
        label: 'Approved',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    },
    conditionally_approved: {
        label: 'Conditionally Approved',
        className: 'border-teal-200 bg-teal-50 text-teal-900',
    },
    declined: {
        label: 'Declined',
        className: 'border-red-200 bg-red-50 text-red-800',
    },
    returned: {
        label: 'Returned',
        className: 'border-orange-200 bg-orange-50 text-orange-900',
    },
    completed: {
        label: 'Completed',
        className: 'border-green-200 bg-green-50 text-green-800',
    },
    archived: {
        label: 'Archived',
        className: 'border-neutral-200 bg-neutral-50 text-neutral-700',
    },
};

const unknownStatus: PapStatusPresentation = {
    label: 'Status unavailable',
    className: 'border-neutral-200 bg-neutral-50 text-neutral-700',
};

export function getPapStatusPresentation(
    status: PapWorkflowStatus,
): PapStatusPresentation {
    return papStatusPresentations[status] ?? unknownStatus;
}
