import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    Bot,
    Building2,
    Check,
    ChevronDown,
    ClipboardCheck,
    FileCheck2,
    FileText,
    Landmark,
    Menu,
    Scale,
    Search,
    ShieldCheck,
    Sparkles,
    Users,
    WalletCards,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { login } from '@/routes';

type NavigationItem = {
    label: string;
    href: string;
};

type Capability = {
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
};

type Role = {
    title: string;
    description: string;
};

type PreviewResource = {
    type: string;
    title: string;
    description: string;
};

type SubscriptionPackage = {
    name: string;
    bestFor: string;
    annual: string;
    monthly: string;
    implementation: string;
    firstYear: string;
    renewal: string;
    recommended?: boolean;
    features: string[];
};

const navigationItems: NavigationItem[] = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Assessment Tools', href: '#assessment-tools' },
    { label: 'Knowledge Hub', href: '#knowledge-hub' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
];

const capabilities: Capability[] = [
    {
        title: 'Centralized PAP Management',
        description:
            'Keep proposals, revisions, supporting files, and status history in one governed workspace.',
        icon: FileText,
    },
    {
        title: 'Structured Evaluation',
        description:
            'Guide assigned evaluators through authorized assessment instruments and evidence-based findings.',
        icon: ClipboardCheck,
    },
    {
        title: 'Review and Approval',
        description:
            'Route completed evaluations to authorized reviewers while preserving separation of duties.',
        icon: FileCheck2,
    },
    {
        title: 'Budget Monitoring',
        description:
            'Record approved financial summaries and GAD-attributed amounts without processing payments.',
        icon: WalletCards,
    },
    {
        title: 'Accomplishment Reporting',
        description:
            'Track implementation progress and prepare consistent organizational accomplishment reports.',
        icon: BarChart3,
    },
    {
        title: 'Reports and Analytics',
        description:
            'Turn authorized records into clear operational and management-level insights.',
        icon: BarChart3,
    },
    {
        title: 'Knowledge Management',
        description:
            'Organize approved references, templates, learning materials, and public resources.',
        icon: BookOpen,
    },
    {
        title: 'Human-Guided AI',
        description:
            'Assist authorized personnel with document review while keeping decisions in human hands.',
        icon: Bot,
    },
    {
        title: 'Audit and Accountability',
        description:
            'Maintain traceable records of material actions, decisions, and workflow changes.',
        icon: Scale,
    },
];

const workflowSteps = [
    'Submit a PAP',
    'Screen and assign',
    'Evaluate using an authorized assessment tool',
    'Return for revision when required',
    'Review and approve',
    'Monitor implementation and financial progress',
    'Submit accomplishment reports',
    'Publish approved public knowledge',
];

const assessmentTools = ['HGDG', 'GMEF', 'GeRL', 'GFAsT-NGA', 'GFAsT-LGU'];

const roles: Role[] = [
    {
        title: 'Proponent / PAP Submitter',
        description: 'Prepares, submits, revises, and tracks assigned PAPs.',
    },
    {
        title: 'Evaluator / GFPS Member',
        description:
            'Reviews assigned PAPs using authorized assessment tools and provides findings.',
    },
    {
        title: 'Approver / GFPS Chairperson',
        description:
            'Reviews completed evaluations and issues authorized approval decisions.',
    },
];

const previewResources: PreviewResource[] = [
    {
        type: 'Guide preview',
        title: 'Preparing a complete PAP submission',
        description:
            'A demonstration of how approved guidance may be presented in the Knowledge Hub.',
    },
    {
        type: 'Template preview',
        title: 'Accomplishment report reference',
        description:
            'Sample presentation only; no official downloadable file is connected.',
    },
    {
        type: 'Learning preview',
        title: 'Understanding the review workflow',
        description:
            'Preview content showing how future authorized learning resources may appear.',
    },
];

const subscriptionPackages: SubscriptionPackage[] = [
    {
        name: 'Agency Starter',
        bestFor: 'Small organizations beginning digital GAD monitoring.',
        annual: '₱336,000',
        monthly: '₱28,000',
        implementation: '₱112,000',
        firstYear: '₱448,000',
        renewal: '₱336,000',
        features: [
            'One organization',
            'Up to 15 named users',
            'Up to 3 evaluators or approvers',
            'Up to 500 PAP submissions annually',
            '20 GB storage',
            '250 AI analyses annually',
            'Core submission, evaluation, revision, and approval workflow',
            'Basic assessment templates',
            'Budget recording and standard reports',
            'PDF and CSV exports',
            'One online training session',
        ],
    },
    {
        name: 'Agency Professional',
        bestFor: 'An established agency with a complete GFPS workflow.',
        annual: '₱672,000',
        monthly: '₱56,000',
        implementation: '₱224,000',
        firstYear: '₱896,000',
        renewal: '₱672,000',
        recommended: true,
        features: [
            'One organization',
            'Up to 40 named users',
            'Up to 10 evaluators or approvers',
            'Up to 3,000 PAP submissions annually',
            '100 GB storage',
            '1,500 AI analyses annually',
            'Complete supported assessment templates',
            'Configurable scorecards',
            'Evaluator assignment',
            'Multi-stage evaluation and approval',
            'Human-validated AI assistance',
            'PAP implementation and accomplishment monitoring',
            'Detailed budget tracking',
            'Advanced analytics and reports',
            'Up to three training sessions annually',
        ],
    },
    {
        name: 'Agency Premium',
        bestFor:
            'Large institutions with departments, campuses, branches, or field offices.',
        annual: '₱1,120,000',
        monthly: '₱93,333.33',
        implementation: '₱392,000',
        firstYear: '₱1,512,000',
        renewal: '₱1,120,000',
        features: [
            'One main institution',
            'Up to 10 internal organizational units',
            'Up to 100 named users',
            'Up to 25 evaluators or approvers',
            'Up to 10,000 PAP submissions annually',
            '300 GB storage',
            '5,000 AI analyses annually',
            'Internal organizational hierarchy',
            'Delegated unit administrators',
            'Consolidated analytics',
            'Cross-unit comparisons',
            'Workload and turnaround monitoring',
            'Executive financial and performance dashboards',
            'Up to six training sessions annually',
        ],
    },
];

const organizationTypes = [
    'Government agencies',
    'Local government units',
    'State universities and colleges',
    'Schools and academic institutions',
    'Private institutions',
    'GAD councils and consortia',
];

const sectionClassName = 'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10';
const focusClassName =
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-purple/30 focus-visible:ring-offset-2';
const primaryButtonClassName = `inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-purple px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep ${focusClassName}`;
const secondaryButtonClassName = `inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-text transition-colors hover:border-brand-purple hover:text-brand-purple ${focusClassName}`;

function BrandMark({ inverse = false }: { inverse?: boolean }) {
    return (
        <span
            className={`grid size-12 place-items-center rounded-md ${
                inverse ? 'bg-white p-1' : ''
            }`}
        >
            <img
                src="/images/gadable-logo-icon.png"
                alt="GADable"
                className="size-full object-contain"
            />
        </span>
    );
}

function LandingHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        firstMobileLinkRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    return (
        <header className="sticky top-0 z-50 border-b border-brand-border bg-white/95 backdrop-blur-sm">
            <div
                className={`${sectionClassName} flex min-h-18 items-center justify-between gap-6`}
            >
                <a
                    href="#home"
                    className={`shrink-0 ${focusClassName}`}
                    aria-label="GADable home"
                >
                    <BrandMark />
                </a>

                <nav
                    className="hidden items-center gap-5 xl:flex"
                    aria-label="Primary navigation"
                >
                    {navigationItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className={`text-sm font-medium text-brand-muted transition-colors hover:text-brand-purple ${focusClassName}`}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center xl:flex">
                    <Link
                        href={login()}
                        className={primaryButtonClassName}
                        prefetch
                    >
                        User Sign In
                    </Link>
                </div>

                <button
                    type="button"
                    className={`grid size-11 place-items-center rounded-md border border-brand-border text-brand-text xl:hidden ${focusClassName}`}
                    aria-label={
                        isOpen
                            ? 'Close navigation menu'
                            : 'Open navigation menu'
                    }
                    aria-expanded={isOpen}
                    aria-controls="mobile-navigation"
                    onClick={() => setIsOpen((current) => !current)}
                >
                    {isOpen ? (
                        <X className="size-5" aria-hidden="true" />
                    ) : (
                        <Menu className="size-5" aria-hidden="true" />
                    )}
                </button>
            </div>

            {isOpen && (
                <nav
                    id="mobile-navigation"
                    className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-brand-border bg-white px-5 py-5 xl:hidden"
                    aria-label="Mobile navigation"
                >
                    <div className="mx-auto grid max-w-7xl gap-1">
                        {navigationItems.map((item, index) => (
                            <a
                                key={item.href}
                                ref={
                                    index === 0 ? firstMobileLinkRef : undefined
                                }
                                href={item.href}
                                className={`flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-brand-text hover:bg-brand-soft ${focusClassName}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.label}
                            </a>
                        ))}
                        <Link
                            href={login()}
                            className={`${primaryButtonClassName} mt-3`}
                            onClick={() => setIsOpen(false)}
                        >
                            User Sign In
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
}

function SectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description?: string;
}) {
    return (
        <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-[0.16em] text-brand-magenta uppercase">
                {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl">
                {title}
            </h2>
            {description && (
                <p className="mt-4 text-base leading-7 text-brand-muted sm:text-lg">
                    {description}
                </p>
            )}
        </div>
    );
}

function HeroSection() {
    return (
        <section
            id="home"
            className="scroll-mt-24 border-b border-brand-border bg-white py-16 sm:py-20 lg:py-24"
        >
            <div
                className={`${sectionClassName} grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]`}
            >
                <div>
                    <p className="text-sm font-semibold tracking-[0.16em] text-brand-magenta uppercase">
                        Gender and Development program management
                    </p>
                    <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-brand-text sm:text-5xl lg:text-6xl">
                        Smarter GAD Planning. Stronger Inclusive Outcomes.
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-brand-muted">
                        GADable is a secure digital platform for submitting,
                        evaluating, approving, monitoring, and reporting Gender
                        and Development Programs, Activities, and Projects.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <a href="#contact" className={primaryButtonClassName}>
                            Request a Demonstration
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </a>
                        <a href="#about" className={secondaryButtonClassName}>
                            Explore GADable
                        </a>
                        <Link
                            href={login()}
                            className={`inline-flex min-h-11 items-center justify-center px-3 py-3 text-sm font-semibold text-brand-purple underline decoration-brand-border underline-offset-4 hover:decoration-brand-purple ${focusClassName}`}
                        >
                            User Sign In
                        </Link>
                    </div>
                </div>

                <div
                    className="overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm"
                    aria-label="Platform preview using demonstration data"
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border bg-brand-soft px-5 py-4">
                        <div>
                            <p className="font-semibold text-brand-text">
                                Platform Preview
                            </p>
                            <p className="text-xs text-brand-muted">
                                All values are demonstration data
                            </p>
                        </div>
                        <span className="rounded-full border border-brand-border bg-white px-3 py-1 text-xs font-semibold text-brand-purple">
                            Preview only
                        </span>
                    </div>
                    <div className="grid gap-4 p-5 sm:grid-cols-2">
                        {[
                            ['PAP workflow status', 'Under Evaluation'],
                            ['Evaluation progress', '6 of 8 steps'],
                            ['Approved budget', '₱2,450,000'],
                            ['GAD-attributed amount', '₱1,715,000'],
                        ].map(([label, value]) => (
                            <div
                                key={label}
                                className="rounded-lg border border-brand-border p-4"
                            >
                                <p className="text-xs font-medium text-brand-muted">
                                    {label}
                                </p>
                                <p className="mt-2 text-lg font-semibold break-words text-brand-text">
                                    {value}
                                </p>
                                <p className="mt-1 text-[11px] text-brand-muted">
                                    Demonstration data
                                </p>
                            </div>
                        ))}
                        <div className="rounded-lg border border-brand-border p-4 sm:col-span-2">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-medium text-brand-muted">
                                        Monitoring status
                                    </p>
                                    <p className="mt-1 font-semibold text-brand-text">
                                        Implementation in progress
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-purple">
                                    <span
                                        className="size-2 rounded-full bg-brand-magenta"
                                        aria-hidden="true"
                                    />
                                    Demo status
                                </span>
                            </div>
                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-soft">
                                <div className="h-full w-2/3 rounded-full bg-brand-purple" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function AboutSection() {
    return (
        <section id="about" className="scroll-mt-24 py-20 sm:py-24">
            <div className={sectionClassName}>
                <SectionHeading
                    eyebrow="About GADable"
                    title="One governed space for the complete PAP lifecycle"
                    description="GADable is a multi-organization platform that brings structured submission, evaluation, revision, approval, monitoring, reporting, knowledge management, analytics, audit history, and human-guided AI assistance into one accountable workflow."
                />
                <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-brand-border bg-brand-border sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        'Structured PAP submission',
                        'Evaluation and scorecard workflows',
                        'Revision and resubmission',
                        'Review and approval',
                        'Budget and GAD-attribution summaries',
                        'Monitoring and accomplishment reporting',
                        'Knowledge management',
                        'Analytics and audit history',
                    ].map((item) => (
                        <div
                            key={item}
                            className="flex items-start gap-3 bg-white p-5"
                        >
                            <Check
                                className="mt-0.5 size-4 shrink-0 text-brand-purple"
                                aria-hidden="true"
                            />
                            <span className="text-sm leading-6 font-medium text-brand-text">
                                {item}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function IntendedUsersSection() {
    const icons = [Landmark, Building2, BookOpen, Users, Building2, Scale];

    return (
        <section className="border-y border-brand-border bg-brand-soft py-20 sm:py-24">
            <div className={sectionClassName}>
                <SectionHeading
                    eyebrow="Intended users"
                    title="Designed for organizations advancing Gender and Development"
                    description="GADable is designed for institutions that need a clear, accountable way to coordinate GAD planning, assessment, and reporting."
                />
                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {organizationTypes.map((organization, index) => {
                        const Icon = icons[index];

                        return (
                            <div
                                key={organization}
                                className="flex items-center gap-4 rounded-lg border border-brand-border bg-white p-5"
                            >
                                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-brand-soft text-brand-purple">
                                    <Icon
                                        className="size-5"
                                        aria-hidden={true}
                                    />
                                </span>
                                <p className="font-semibold text-brand-text">
                                    {organization}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function CapabilityGrid() {
    return (
        <section className="py-20 sm:py-24">
            <div className={sectionClassName}>
                <SectionHeading
                    eyebrow="Core capabilities"
                    title="Purpose-built for accountable GAD program delivery"
                    description="Each capability supports an authorized human workflow and a traceable institutional record."
                />
                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {capabilities.map((capability) => {
                        const Icon = capability.icon;

                        return (
                            <article
                                key={capability.title}
                                className="rounded-lg border border-brand-border bg-white p-6"
                            >
                                <span
                                    className="grid size-10 place-items-center rounded-md bg-brand-soft text-brand-purple"
                                    aria-hidden="true"
                                >
                                    <Icon className="size-5" />
                                </span>
                                <h3 className="mt-5 text-lg font-semibold text-brand-text">
                                    {capability.title}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-brand-muted">
                                    {capability.description}
                                </p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function WorkflowSection() {
    return (
        <section
            id="how-it-works"
            className="scroll-mt-24 border-y border-brand-border bg-brand-soft py-20 sm:py-24"
        >
            <div className={sectionClassName}>
                <SectionHeading
                    eyebrow="How GADable works"
                    title="A clear path from proposal to approved public knowledge"
                    description="Every step is assigned, governed, and recorded without relying on animation or hidden process rules."
                />
                <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {workflowSteps.map((step, index) => (
                        <li
                            key={step}
                            className="relative rounded-lg border border-brand-border bg-white p-5"
                        >
                            <span className="text-sm font-semibold text-brand-magenta">
                                Step {index + 1}
                            </span>
                            <p className="mt-3 leading-6 font-semibold text-brand-text">
                                {step}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

function AssessmentToolsSection() {
    return (
        <section id="assessment-tools" className="scroll-mt-24 py-20 sm:py-24">
            <div className={sectionClassName}>
                <SectionHeading
                    eyebrow="Assessment tools"
                    title="Support for authorized and versioned instruments"
                    description="Assessment templates and scorecards are configured using authoritative instruments approved by the responsible organization."
                />
                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {assessmentTools.map((tool) => (
                        <article
                            key={tool}
                            className="rounded-lg border border-brand-border bg-white p-6"
                        >
                            <p className="text-xl font-semibold text-brand-purple">
                                {tool}
                            </p>
                            <p className="mt-3 text-sm leading-6 text-brand-muted">
                                Authorized instrument configuration
                            </p>
                        </article>
                    ))}
                </div>
                <p className="mt-6 max-w-4xl text-sm leading-6 text-brand-muted">
                    GADable does not invent assessment questions, scoring
                    formulas, thresholds, policy interpretations, or legal
                    requirements.
                </p>
            </div>
        </section>
    );
}

function HumanGuidedAiSection() {
    return (
        <section className="border-y border-brand-border bg-brand-deep py-20 text-white sm:py-24">
            <div
                className={`${sectionClassName} grid gap-10 lg:grid-cols-[0.85fr_1.15fr]`}
            >
                <div>
                    <p className="text-sm font-semibold tracking-[0.16em] text-white/65 uppercase">
                        Human-guided AI
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                        Assistance that keeps people accountable
                    </h2>
                    <p className="mt-4 text-base leading-7 text-white/75">
                        AI can support authorized personnel with document text
                        extraction, proposal summarization,
                        important-information identification,
                        missing-information detection, suggested
                        classifications, document comparison, and draft
                        insights.
                    </p>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/8 p-6 sm:p-8">
                    <Sparkles
                        className="size-7 text-white"
                        aria-hidden="true"
                    />
                    <p className="mt-5 text-xl leading-8 font-semibold sm:text-2xl">
                        AI-generated results are advisory and require validation
                        by authorized GAD personnel. AI does not issue the
                        official evaluation score or approval decision.
                    </p>
                </div>
            </div>
        </section>
    );
}

function RoleSection() {
    return (
        <section className="py-20 sm:py-24">
            <div className={sectionClassName}>
                <SectionHeading
                    eyebrow="User roles"
                    title="Clear responsibilities, explicit authority"
                    description="Roles are assigned and enforced by the organization and platform. Users cannot grant themselves authority."
                />
                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role, index) => (
                        <article
                            key={role.title}
                            className="rounded-lg border border-brand-border p-6"
                        >
                            <span className="text-sm font-semibold text-brand-magenta">
                                Role {index + 1}
                            </span>
                            <h3 className="mt-3 text-lg font-semibold text-brand-text">
                                {role.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-brand-muted">
                                {role.description}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function KnowledgeHubPreview() {
    return (
        <section
            id="knowledge-hub"
            className="scroll-mt-24 border-y border-brand-border bg-brand-soft py-20 sm:py-24"
        >
            <div className={sectionClassName}>
                <SectionHeading
                    eyebrow="Knowledge Hub"
                    title="A public learning and information area"
                    description="The Knowledge Hub may contain approved public PAP summaries, accomplishment reports, policies, manuals, templates, training materials, news, good practices, and frequently asked questions."
                />
                <div className="mt-10 rounded-xl border border-brand-border bg-white p-5 sm:p-7">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <label className="relative">
                            <span className="mb-2 block text-sm font-medium text-brand-text">
                                Search resources
                            </span>
                            <Search
                                className="pointer-events-none absolute bottom-3 left-3 size-4 text-brand-muted"
                                aria-hidden="true"
                            />
                            <input
                                type="search"
                                placeholder="Search preview"
                                className={`h-11 w-full rounded-md border border-brand-border bg-white pr-3 pl-10 text-sm text-brand-text placeholder:text-brand-muted ${focusClassName}`}
                            />
                        </label>
                        {[
                            ['Resource type', 'All resource types'],
                            ['Topic', 'All topics'],
                            ['Publication year', 'All years'],
                        ].map(([label, placeholder]) => (
                            <label key={label}>
                                <span className="mb-2 block text-sm font-medium text-brand-text">
                                    {label}
                                </span>
                                <select
                                    className={`h-11 w-full rounded-md border border-brand-border bg-white px-3 text-sm text-brand-text ${focusClassName}`}
                                    defaultValue=""
                                >
                                    <option value="">{placeholder}</option>
                                </select>
                            </label>
                        ))}
                    </div>

                    <div className="mt-8 grid gap-4 lg:grid-cols-3">
                        {previewResources.map((resource) => (
                            <article
                                key={resource.title}
                                className="rounded-lg border border-brand-border p-5"
                            >
                                <span className="text-xs font-semibold tracking-wide text-brand-magenta uppercase">
                                    {resource.type}
                                </span>
                                <h3 className="mt-3 font-semibold text-brand-text">
                                    {resource.title}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-brand-muted">
                                    {resource.description}
                                </p>
                            </article>
                        ))}
                    </div>

                    <div className="mt-5 flex flex-col items-start justify-between gap-4 rounded-lg border border-dashed border-brand-border bg-brand-soft p-5 sm:flex-row sm:items-center">
                        <div>
                            <p className="font-semibold text-brand-text">
                                No live public resources are connected yet
                            </p>
                            <p className="mt-1 text-sm text-brand-muted">
                                This is a safe preview and empty state. Only
                                explicitly approved public content will appear.
                            </p>
                        </div>
                        <button
                            type="button"
                            disabled
                            className="inline-flex min-h-11 shrink-0 cursor-not-allowed items-center justify-center rounded-md border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-muted opacity-75"
                        >
                            Visit the Knowledge Hub
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SecuritySection() {
    const safeguards = [
        'Role-based authorization',
        'Organization data isolation',
        'Controlled document access',
        'Multi-factor authentication readiness',
        'Secure session management',
        'Audit history',
        'Human-controlled evaluation and approval',
        'Explicit authorization before public publication',
    ];

    return (
        <section className="py-20 sm:py-24">
            <div
                className={`${sectionClassName} grid gap-10 lg:grid-cols-[0.8fr_1.2fr]`}
            >
                <SectionHeading
                    eyebrow="Security and governance"
                    title="Controls designed around institutional responsibility"
                    description="GADable’s security direction focuses on clear authority, organization boundaries, controlled access, and traceable decisions."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    {safeguards.map((safeguard) => (
                        <div
                            key={safeguard}
                            className="flex items-start gap-3 rounded-lg border border-brand-border p-5"
                        >
                            <ShieldCheck
                                className="mt-0.5 size-5 shrink-0 text-brand-purple"
                                aria-hidden="true"
                            />
                            <span className="text-sm leading-6 font-semibold text-brand-text">
                                {safeguard}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function PricingSection() {
    return (
        <section
            id="pricing"
            className="scroll-mt-24 border-y border-brand-border bg-brand-soft py-20 sm:py-24"
        >
            <div className={sectionClassName}>
                <SectionHeading
                    eyebrow="Agency subscriptions"
                    title="Indicative annual packages"
                    description="Choose a planning baseline for requirements consultation. Subscriptions are billed annually; monthly figures are equivalents only."
                />
                <div className="mt-10 grid items-start gap-5 lg:grid-cols-3">
                    {subscriptionPackages.map((subscription) => (
                        <article
                            key={subscription.name}
                            className={`rounded-xl border bg-white p-6 ${
                                subscription.recommended
                                    ? 'border-2 border-brand-purple'
                                    : 'border-brand-border'
                            }`}
                        >
                            <div className="flex min-h-8 items-start justify-between gap-3">
                                <h3 className="text-xl font-semibold text-brand-text">
                                    {subscription.name}
                                </h3>
                                {subscription.recommended && (
                                    <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-purple">
                                        Recommended
                                    </span>
                                )}
                            </div>
                            <p className="mt-3 min-h-12 text-sm leading-6 text-brand-muted">
                                {subscription.bestFor}
                            </p>
                            <div className="mt-6 border-y border-brand-border py-5">
                                <p className="text-sm text-brand-muted">
                                    Annual subscription
                                </p>
                                <p className="mt-1 text-3xl font-semibold break-words text-brand-text">
                                    {subscription.annual}
                                </p>
                                <p className="mt-2 text-sm text-brand-muted">
                                    {subscription.monthly} monthly equivalent
                                </p>
                            </div>
                            <dl className="mt-5 grid gap-3 text-sm">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-brand-muted">
                                        One-time implementation
                                    </dt>
                                    <dd className="font-semibold text-brand-text">
                                        {subscription.implementation}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-brand-muted">
                                        First-year total
                                    </dt>
                                    <dd className="font-semibold text-brand-text">
                                        {subscription.firstYear}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-brand-muted">
                                        Year 2 renewal
                                    </dt>
                                    <dd className="font-semibold text-brand-text">
                                        {subscription.renewal}
                                    </dd>
                                </div>
                            </dl>
                            <ul className="mt-6 grid gap-3">
                                {subscription.features
                                    .slice(0, 5)
                                    .map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-2 text-sm leading-6 text-brand-muted"
                                        >
                                            <Check
                                                className="mt-1 size-4 shrink-0 text-brand-purple"
                                                aria-hidden="true"
                                            />
                                            {feature}
                                        </li>
                                    ))}
                            </ul>
                            <details className="mt-4 border-t border-brand-border pt-4">
                                <summary
                                    className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-brand-purple [&::-webkit-details-marker]:hidden ${focusClassName}`}
                                >
                                    View complete feature list
                                    <ChevronDown
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </summary>
                                <ul className="mt-3 grid gap-3">
                                    {subscription.features
                                        .slice(5)
                                        .map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-start gap-2 text-sm leading-6 text-brand-muted"
                                            >
                                                <Check
                                                    className="mt-1 size-4 shrink-0 text-brand-purple"
                                                    aria-hidden="true"
                                                />
                                                {feature}
                                            </li>
                                        ))}
                                </ul>
                            </details>
                            <a
                                href="#contact"
                                className={`${subscription.recommended ? primaryButtonClassName : secondaryButtonClassName} mt-6 w-full`}
                            >
                                Request a Demonstration
                            </a>
                        </article>
                    ))}
                </div>
                <p className="mt-8 rounded-lg border border-brand-border bg-white p-5 text-sm leading-6 text-brand-muted">
                    Indicative prices are inclusive of 12% VAT and subject to
                    requirements validation, final scope, contract terms, and
                    applicable procurement rules. Monthly amounts are
                    equivalents only; subscriptions are billed annually.
                </p>
            </div>
        </section>
    );
}

function ContactSection() {
    const fieldClassName = `mt-2 h-11 w-full rounded-md border border-brand-border bg-white px-3 text-sm text-brand-text placeholder:text-brand-muted ${focusClassName}`;

    return (
        <section id="contact" className="scroll-mt-24 py-20 sm:py-24">
            <div
                className={`${sectionClassName} grid gap-12 lg:grid-cols-[0.8fr_1.2fr]`}
            >
                <div>
                    <SectionHeading
                        eyebrow="Contact"
                        title="Build a more transparent and evidence-informed GAD program."
                        description="Schedule a demonstration or requirements consultation to explore how GADable may support your organization."
                    />
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-start xl:flex-row">
                        <a
                            href="#contact-form"
                            className={primaryButtonClassName}
                        >
                            Request a Demonstration
                        </a>
                        <a
                            href="#contact-form"
                            className={secondaryButtonClassName}
                        >
                            Request a Proposal
                        </a>
                        <Link
                            href={login()}
                            className={`inline-flex min-h-11 items-center px-3 text-sm font-semibold text-brand-purple ${focusClassName}`}
                        >
                            User Sign In
                        </Link>
                    </div>
                </div>
                <div
                    id="contact-form"
                    className="rounded-xl border border-brand-border bg-brand-soft p-5 sm:p-8"
                >
                    <div
                        className="rounded-md border border-brand-border bg-white p-4 text-sm leading-6 text-brand-muted"
                        role="status"
                    >
                        Contact submission is not yet configured. You may review
                        the fields below, but no information will be sent or
                        stored.
                    </div>
                    <form
                        className="mt-6 grid gap-5 sm:grid-cols-2"
                        aria-describedby="contact-status"
                    >
                        <span id="contact-status" className="sr-only">
                            This form is a non-submitting interface preview.
                        </span>
                        {[
                            ['Organization name', 'organization-name', 'text'],
                            ['Contact person', 'contact-person', 'text'],
                            ['Official email', 'official-email', 'email'],
                            ['Contact number', 'contact-number', 'tel'],
                        ].map(([label, id, type]) => (
                            <label
                                key={id}
                                htmlFor={id}
                                className="text-sm font-medium text-brand-text"
                            >
                                {label}
                                <input
                                    id={id}
                                    type={type}
                                    disabled
                                    className={`${fieldClassName} disabled:cursor-not-allowed disabled:bg-white/70`}
                                    aria-describedby="contact-status"
                                />
                            </label>
                        ))}
                        {[
                            ['Organization type', 'organization-type'],
                            ['Preferred package', 'preferred-package'],
                        ].map(([label, id]) => (
                            <label
                                key={id}
                                htmlFor={id}
                                className="text-sm font-medium text-brand-text"
                            >
                                {label}
                                <select
                                    id={id}
                                    disabled
                                    className={`${fieldClassName} disabled:cursor-not-allowed disabled:bg-white/70`}
                                    aria-describedby="contact-status"
                                >
                                    <option>
                                        Backend configuration required
                                    </option>
                                </select>
                            </label>
                        ))}
                        <label
                            htmlFor="message"
                            className="text-sm font-medium text-brand-text sm:col-span-2"
                        >
                            Message
                            <textarea
                                id="message"
                                disabled
                                rows={4}
                                className={`mt-2 w-full rounded-md border border-brand-border bg-white px-3 py-3 text-sm text-brand-text disabled:cursor-not-allowed disabled:bg-white/70 ${focusClassName}`}
                                aria-describedby="contact-status"
                            />
                        </label>
                        <button
                            type="button"
                            disabled
                            className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md bg-brand-purple px-5 py-3 text-sm font-semibold text-white opacity-55 sm:col-span-2"
                        >
                            Submission unavailable until backend configuration
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}

function LandingFooter() {
    return (
        <footer className="bg-brand-deep py-14 text-white">
            <div className={`${sectionClassName} grid gap-10 md:grid-cols-3`}>
                <div className="lg:col-span-1">
                    <BrandMark inverse />
                    <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">
                        A digital platform for accountable, human-controlled GAD
                        planning, evaluation, monitoring, and reporting.
                    </p>
                </div>
                <nav aria-label="Footer navigation">
                    <h2 className="text-sm font-semibold">Explore</h2>
                    <ul className="mt-4 grid gap-3 text-sm text-white/70">
                        {navigationItems.slice(1).map((item) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    className={`hover:text-white ${focusClassName}`}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <nav aria-label="Support navigation">
                    <h2 className="text-sm font-semibold">Information</h2>
                    <ul className="mt-4 grid gap-3 text-sm text-white/70">
                        {[
                            'Privacy',
                            'Terms',
                            'Accessibility',
                            'Help Center',
                        ].map((label) => (
                            <li key={label}>
                                <span aria-disabled="true">
                                    {label}{' '}
                                    <span className="text-xs">
                                        (coming soon)
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <div
                className={`${sectionClassName} mt-12 border-t border-white/15 pt-6 text-xs text-white/55`}
            >
                © {new Date().getFullYear()} GADable. Public preview.
            </div>
        </footer>
    );
}

export default function Welcome() {
    return (
        <>
            <Head title="GADable">
                <meta
                    name="description"
                    content="GADable is a digital platform for accountable Gender and Development PAP planning, evaluation, monitoring, and reporting."
                />
            </Head>
            <a
                href="#main-content"
                className={`fixed top-3 left-3 z-[100] -translate-y-24 rounded-md bg-brand-deep px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0 ${focusClassName}`}
            >
                Skip to main content
            </a>
            <div className="min-h-screen overflow-x-clip bg-white text-brand-text">
                <LandingHeader />
                <main id="main-content">
                    <HeroSection />
                    <AboutSection />
                    <IntendedUsersSection />
                    <CapabilityGrid />
                    <WorkflowSection />
                    <AssessmentToolsSection />
                    <HumanGuidedAiSection />
                    <RoleSection />
                    <KnowledgeHubPreview />
                    <SecuritySection />
                    <PricingSection />
                    <ContactSection />
                </main>
                <LandingFooter />
            </div>
        </>
    );
}
