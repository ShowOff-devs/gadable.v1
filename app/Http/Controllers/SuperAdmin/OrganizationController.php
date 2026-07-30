<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Actions\SuperAdmin\Organizations\RecordOrganizationEvent;
use App\Contracts\LabelledEnum;
use App\Enums\DataClassification;
use App\Enums\OrganizationOnboardingStatus;
use App\Enums\OrganizationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\StoreOrganizationRequest;
use App\Http\Requests\SuperAdmin\UpdateOrganizationRequest;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Organization::class);
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::enum(OrganizationStatus::class)],
            'onboarding' => ['nullable', Rule::enum(OrganizationOnboardingStatus::class)],
            'type' => ['nullable', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:255'],
            'classification' => ['nullable', Rule::enum(DataClassification::class)],
            'parent' => ['nullable', 'integer', 'exists:organizations,id'],
            'sort' => ['nullable', Rule::in(['name', 'newest', 'oldest', 'last_activity'])],
        ]);
        $organizations = Organization::query()
            ->with('parent:id,official_name')
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($q) => $q
                ->where('official_name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%")
                ->orWhere('acronym', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('region_name', 'like', "%{$search}%")
                ->orWhere('province_name', 'like', "%{$search}%")
                ->orWhere('locality_name', 'like', "%{$search}%")))
            ->when($filters['status'] ?? null, fn ($q, $value) => $q->where('account_status', $value))
            ->when($filters['onboarding'] ?? null, fn ($q, $value) => $q->where('onboarding_status', $value))
            ->when($filters['type'] ?? null, fn ($q, $value) => $q->where('organization_type', $value))
            ->when($filters['region'] ?? null, fn ($q, $value) => $q->where('region_name', $value))
            ->when($filters['classification'] ?? null, fn ($q, $value) => $q->where('data_classification', $value))
            ->when($filters['parent'] ?? null, fn ($q, $value) => $q->where('parent_id', $value))
            ->when(($filters['sort'] ?? 'name') === 'name', fn ($q) => $q->orderBy('official_name'))
            ->when(($filters['sort'] ?? null) === 'newest', fn ($q) => $q->latest())
            ->when(($filters['sort'] ?? null) === 'oldest', fn ($q) => $q->oldest())
            ->when(($filters['sort'] ?? null) === 'last_activity', fn ($q) => $q->orderByDesc('updated_at'))
            ->paginate(15)->withQueryString()->through(fn (Organization $org) => $this->summary($org));

        return Inertia::render('super-admin/organizations/index', [
            'organizations' => $organizations,
            'filters' => $filters,
            'filterOptions' => $this->directoryFilterOptions(),
            'counts' => [
                'total' => Organization::count(),
                'active' => Organization::where('account_status', OrganizationStatus::Active->value)->count(),
                'pending' => Organization::where('account_status', OrganizationStatus::PendingActivation->value)->count(),
                'under_review' => Organization::where('onboarding_status', OrganizationOnboardingStatus::UnderReview->value)->count(),
                'attention' => Organization::whereIn('account_status', [OrganizationStatus::Restricted->value, OrganizationStatus::Suspended->value])->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Organization::class);
        return Inertia::render('super-admin/organizations/create', $this->formOptions());
    }

    public function store(StoreOrganizationRequest $request, RecordOrganizationEvent $events): RedirectResponse
    {
        Gate::authorize('create', Organization::class);
        $duplicate = Organization::query()
            ->whereRaw('lower(official_name) = ?', [mb_strtolower($request->string('official_name')->trim()->toString())])
            ->when($request->filled('email'), fn ($query) => $query->orWhereRaw('lower(email) = ?', [mb_strtolower($request->string('email')->trim()->toString())]))
            ->first(['id', 'official_name', 'code']);
        if ($duplicate && ! $request->boolean('confirm_duplicate')) {
            throw ValidationException::withMessages(['confirm_duplicate' => "Possible duplicate: {$duplicate->official_name} ({$duplicate->code}). Review it or explicitly confirm creation."]);
        }
        $organization = DB::transaction(function () use ($request, $events): Organization {
            $organization = Organization::create([...$request->validated(), 'onboarding_status' => OrganizationOnboardingStatus::Draft, 'account_status' => OrganizationStatus::PendingActivation, 'lock_version' => 1, 'created_by' => $request->user()->id]);
            $events->handle($organization, $request->user(), 'organization.created', null, ['official_name' => $organization->official_name, 'code' => $organization->code, 'onboarding_status' => $organization->onboarding_status->value]);
            return $organization;
        });
        return to_route('super-admin.organizations.show', $organization)->with('success', 'Organization registered.');
    }

    public function show(Organization $organization): Response
    {
        Gate::authorize('view', $organization);
        $organization->load(['parent:id,official_name,code', 'children:id,parent_id,official_name,code,account_status', 'events' => fn ($q) => $q->latest()->limit(30), 'documents' => fn ($q) => $q->latest()]);
        return Inertia::render('super-admin/organizations/show', ['organization' => $this->detail($organization), 'onboardingOptions' => $this->validOnboardingOptions($organization->onboarding_status), 'statusOptions' => $this->validStatusOptions($organization->account_status)]);
    }

    public function edit(Organization $organization): Response
    {
        Gate::authorize('update', $organization);
        return Inertia::render('super-admin/organizations/edit', [...$this->formOptions($organization), 'organization' => $this->detail($organization)]);
    }

    public function update(UpdateOrganizationRequest $request, Organization $organization, RecordOrganizationEvent $events): RedirectResponse
    {
        Gate::authorize('update', $organization);
        DB::transaction(function () use ($request, $organization, $events): void {
            $locked = Organization::query()->lockForUpdate()->findOrFail($organization->id);
            if ($locked->lock_version !== (int) $request->validated('lock_version')) {
                throw ValidationException::withMessages(['lock_version' => 'This record changed. Refresh and try again.']);
            }
            if ($this->wouldCreateCycle($locked, $request->integer('parent_id') ?: null)) {
                throw ValidationException::withMessages(['parent_id' => 'An organization cannot be placed beneath one of its descendants.']);
            }
            $parentChanged = $locked->parent_id !== ($request->integer('parent_id') ?: null);
            if ($parentChanged && $locked->account_status === OrganizationStatus::Active && blank($request->validated('hierarchy_reason'))) {
                throw ValidationException::withMessages(['hierarchy_reason' => 'A reason is required when changing the hierarchy of an active organization.']);
            }
            $before = $locked->only(['official_name', 'code', 'parent_id', 'data_classification']);
            $locked->fill($request->safe()->except('lock_version', 'hierarchy_reason', 'confirm_duplicate'));
            $locked->forceFill(['updated_by' => $request->user()->id, 'lock_version' => $locked->lock_version + 1])->save();
            $events->handle($locked, $request->user(), 'organization.updated', $before, $locked->only(['official_name', 'code', 'parent_id', 'data_classification']), $parentChanged ? $request->validated('hierarchy_reason') : null);
        });
        return to_route('super-admin.organizations.show', $organization)->with('success', 'Organization updated.');
    }

    /** @return array<string, mixed> */
    private function summary(Organization $org): array { return ['id' => $org->id, 'officialName' => $org->official_name, 'code' => $org->code, 'acronym' => $org->acronym, 'type' => $org->organization_type, 'accountStatus' => $org->account_status->value, 'onboardingStatus' => $org->onboarding_status->value, 'parent' => $org->parent?->official_name, 'updatedAt' => $org->updated_at?->toIso8601String()]; }

    /** @return array<string, mixed> */
    private function detail(Organization $org): array
    {
        return [...$this->summary($org), ...$org->only(['description', 'website', 'email', 'phone', 'established_on', 'parent_id', 'organization_type', 'geographic_scope', 'region_name', 'province_name', 'locality_name', 'address_line', 'official_contact_name', 'official_contact_position', 'official_contact_email', 'identity_verified', 'authority_verified', 'primary_admin_ready', 'subscription_ready', 'security_ready', 'has_critical_issue', 'lock_version']), 'dataClassification' => $org->data_classification->value, 'activationReady' => $org->isActivationReady(), 'activationBlockers' => $org->activationBlockers(), 'children' => $org->relationLoaded('children') ? $org->children->map(fn ($child) => $this->summary($child)) : [], 'events' => $org->relationLoaded('events') ? $org->events->map(fn ($event) => ['id' => $event->id, 'action' => $event->action, 'outcome' => $event->outcome, 'reason' => $event->reason, 'reference' => $event->reference, 'createdAt' => $event->created_at?->toIso8601String()]) : [], 'documents' => $org->relationLoaded('documents') ? $org->documents->map(fn ($doc) => ['id' => $doc->id, 'type' => $doc->document_type, 'name' => $doc->display_name, 'mimeType' => $doc->mime_type, 'size' => $doc->size, 'scanStatus' => $doc->scan_status, 'verificationStatus' => $doc->verification_status]) : []];
    }

    /** @return array<string, mixed> */
    private function formOptions(?Organization $exclude = null): array { return ['parents' => Organization::query()->when($exclude, fn ($q) => $q->whereKeyNot($exclude->id))->orderBy('official_name')->get(['id', 'official_name', 'code']), 'classifications' => $this->enumOptions(DataClassification::cases()), 'referenceDataConfigured' => false]; }

    /** @return array<string, mixed> */
    private function directoryFilterOptions(): array
    {
        return [
            'types' => Organization::query()->whereNotNull('organization_type')->distinct()->orderBy('organization_type')->pluck('organization_type'),
            'regions' => Organization::query()->whereNotNull('region_name')->distinct()->orderBy('region_name')->pluck('region_name'),
            'parents' => Organization::query()->has('children')->orderBy('official_name')->get(['id', 'official_name']),
            'classifications' => $this->enumOptions(DataClassification::cases()),
        ];
    }

    /** @return array<int, array{value:string, label:string}> */
    private function validOnboardingOptions(OrganizationOnboardingStatus $current): array
    {
        $targets = match ($current) {
            OrganizationOnboardingStatus::Draft => [OrganizationOnboardingStatus::Submitted, OrganizationOnboardingStatus::Cancelled],
            OrganizationOnboardingStatus::Submitted => [OrganizationOnboardingStatus::UnderReview, OrganizationOnboardingStatus::ForClarification, OrganizationOnboardingStatus::Cancelled],
            OrganizationOnboardingStatus::UnderReview => [OrganizationOnboardingStatus::ForClarification, OrganizationOnboardingStatus::Verified, OrganizationOnboardingStatus::Rejected],
            OrganizationOnboardingStatus::ForClarification => [OrganizationOnboardingStatus::Submitted, OrganizationOnboardingStatus::Cancelled],
            OrganizationOnboardingStatus::Verified => [OrganizationOnboardingStatus::Approved, OrganizationOnboardingStatus::ForClarification, OrganizationOnboardingStatus::Rejected],
            OrganizationOnboardingStatus::Rejected => [OrganizationOnboardingStatus::Draft],
            default => [],
        };

        return $this->enumOptions($targets);
    }

    /** @return array<int, array{value:string, label:string}> */
    private function validStatusOptions(OrganizationStatus $current): array
    {
        $targets = match ($current) {
            OrganizationStatus::PendingActivation => [OrganizationStatus::Active, OrganizationStatus::Archived, OrganizationStatus::Terminated],
            OrganizationStatus::Active => [OrganizationStatus::Restricted, OrganizationStatus::Suspended, OrganizationStatus::Archived, OrganizationStatus::Terminated],
            OrganizationStatus::Restricted => [OrganizationStatus::Active, OrganizationStatus::Suspended, OrganizationStatus::Archived, OrganizationStatus::Terminated],
            OrganizationStatus::Suspended => [OrganizationStatus::Active, OrganizationStatus::Restricted, OrganizationStatus::Archived, OrganizationStatus::Terminated],
            OrganizationStatus::Archived => [OrganizationStatus::PendingActivation, OrganizationStatus::Terminated],
            OrganizationStatus::Terminated => [],
        };

        return $this->enumOptions($targets);
    }
    /**
     * @param  array<int, LabelledEnum&\BackedEnum>  $cases
     * @return array<int, array{value:string, label:string}>
     */
    private function enumOptions(array $cases): array { return array_map(fn ($case) => ['value' => (string) $case->value, 'label' => $case->label()], $cases); }
    private function wouldCreateCycle(Organization $organization, ?int $parentId): bool { while ($parentId) { if ($parentId === $organization->id) return true; $parentId = Organization::whereKey($parentId)->value('parent_id'); } return false; }
}
