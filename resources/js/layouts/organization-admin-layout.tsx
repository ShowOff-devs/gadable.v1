import { Form, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    Building2,
    ChevronDown,
    ClipboardList,
    FileText,
    Gauge,
    LogOut,
    Menu,
    Settings,
    Users,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { dashboard, logout } from '@/routes/organization-admin';

const navigation = [
    { label: 'Dashboard', icon: Gauge, href: dashboard().url },
    {
        label: 'Approved PAPs & Financials',
        icon: FileText,
        href: '/organization-admin/approved-paps',
    },
    { label: 'Evaluations', icon: ClipboardList },
    { label: 'People and Structure', icon: Users },
    {
        label: 'Reports & Analytics',
        icon: BarChart3,
        href: '/organization-admin/reports-analytics',
    },
    { label: 'Subscription and Usage', icon: Building2 },
    { label: 'Organization Settings', icon: Settings },
];

function Navigation() {
    const { url } = usePage();

    return (
        <nav
            aria-label="Organization Admin navigation"
            className="grid gap-1 px-3"
        >
            {navigation.map((item) =>
                item.href ? (
                    <Link
                        key={item.label}
                        href={item.href}
                        aria-current={
                            url.startsWith(item.href) ? 'page' : undefined
                        }
                        className="flex min-h-11 items-center gap-3 rounded-lg bg-white/15 px-3 text-sm font-semibold text-white focus-visible:ring-3 focus-visible:ring-white/50 focus-visible:outline-none"
                    >
                        <item.icon className="size-4" aria-hidden="true" />
                        {item.label}
                    </Link>
                ) : (
                    <div
                        key={item.label}
                        aria-disabled="true"
                        className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-white/55"
                    >
                        <item.icon className="size-4" aria-hidden="true" />
                        {item.label}
                        <span className="sr-only">Not configured</span>
                    </div>
                ),
            )}
        </nav>
    );
}

function Sidebar() {
    return (
        <div className="flex h-full flex-col bg-brand-deep text-white">
            <div className="flex items-center gap-3 px-5 py-5">
                <img
                    src="/images/gadable-logo-icon.png"
                    alt=""
                    className="size-11 rounded-lg bg-white object-contain p-1"
                />
                <div>
                    <p className="font-semibold">GADable</p>
                    <p className="text-xs font-semibold tracking-[0.13em] text-white/65 uppercase">
                        Organization Admin
                    </p>
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pb-4">
                <Navigation />
            </div>
            <div className="border-t border-white/15 p-3">
                <Form {...logout.form()}>
                    {({ processing }) => (
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-white/85 hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-white/50 focus-visible:outline-none"
                        >
                            <LogOut className="size-4" aria-hidden="true" />
                            {processing ? 'Signing out…' : 'Sign Out'}
                        </button>
                    )}
                </Form>
            </div>
        </div>
    );
}

export default function OrganizationAdminLayout({
    children,
}: PropsWithChildren) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-svh bg-brand-soft text-brand-text lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="sticky top-0 hidden h-svh lg:block">
                <Sidebar />
            </aside>
            <div className="min-w-0">
                <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-4 border-b border-brand-border bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <Sheet>
                            <SheetTrigger asChild>
                                <button
                                    type="button"
                                    className="inline-flex size-11 items-center justify-center rounded-lg border border-brand-border lg:hidden"
                                    aria-label="Open navigation menu"
                                >
                                    <Menu
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="w-[18rem] border-0 bg-brand-deep p-0 motion-reduce:transition-none"
                            >
                                <SheetHeader className="sr-only">
                                    <SheetTitle>
                                        Organization Admin navigation
                                    </SheetTitle>
                                    <SheetDescription>
                                        Navigate the authorized organization
                                        workspace.
                                    </SheetDescription>
                                </SheetHeader>
                                <Sidebar />
                            </SheetContent>
                        </Sheet>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                Organization Workspace
                            </p>
                            <p className="text-xs text-brand-muted">
                                Administrative coordination
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled
                            title="Notification center is not configured"
                            className="inline-flex size-11 items-center justify-center rounded-lg text-brand-muted disabled:opacity-60"
                            aria-label="Notifications unavailable"
                        >
                            <Bell className="size-5" aria-hidden="true" />
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex min-h-11 max-w-52 items-center gap-2 rounded-lg px-2 text-left hover:bg-brand-soft focus-visible:ring-3 focus-visible:ring-brand-purple/25 focus-visible:outline-none"
                                >
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-purple text-xs font-bold text-white">
                                        {auth.user.name
                                            .slice(0, 1)
                                            .toUpperCase()}
                                    </span>
                                    <span className="hidden min-w-0 sm:block">
                                        <span className="block truncate text-sm font-semibold">
                                            {auth.user.name}
                                        </span>
                                        <span className="block text-xs text-brand-muted">
                                            Organization Admin
                                        </span>
                                    </span>
                                    <ChevronDown
                                        className="size-4 text-brand-muted"
                                        aria-hidden="true"
                                    />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <span className="block truncate">
                                        {auth.user.name}
                                    </span>
                                    <span className="block truncate text-xs font-normal text-brand-muted">
                                        {auth.user.email}
                                    </span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Form {...logout.form()} className="w-full">
                                        <button
                                            type="submit"
                                            className="flex w-full items-center gap-2"
                                        >
                                            <LogOut aria-hidden="true" />
                                            Sign Out
                                        </button>
                                    </Form>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main id="main-content" className="min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
