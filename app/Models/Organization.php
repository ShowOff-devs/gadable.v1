<?php

namespace App\Models;

use App\Enums\DataClassification;
use App\Enums\OrganizationOnboardingStatus;
use App\Enums\OrganizationStatus;
use Database\Factories\OrganizationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int|null $parent_id
 * @property string $official_name
 * @property string $code
 * @property string|null $acronym
 * @property string|null $organization_type
 * @property DataClassification $data_classification
 * @property OrganizationOnboardingStatus $onboarding_status
 * @property OrganizationStatus $account_status
 * @property bool $identity_verified
 * @property bool $authority_verified
 * @property bool $primary_admin_ready
 * @property bool $subscription_ready
 * @property bool $security_ready
 * @property bool $has_critical_issue
 * @property int $lock_version
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read Organization|null $parent
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Organization> $children
 * @property-read \Illuminate\Database\Eloquent\Collection<int, OrganizationEvent> $events
 * @property-read \Illuminate\Database\Eloquent\Collection<int, OrganizationDocument> $documents
 * @property-read \Illuminate\Database\Eloquent\Collection<int, OrganizationSubscription> $subscriptions
 */

#[Fillable(['parent_id', 'official_name', 'code', 'acronym', 'description', 'website', 'email', 'phone', 'established_on', 'organization_type', 'geographic_scope', 'region_name', 'province_name', 'locality_name', 'address_line', 'official_contact_name', 'official_contact_position', 'official_contact_email', 'data_classification', 'onboarding_status', 'account_status', 'identity_verified', 'authority_verified', 'primary_admin_ready', 'subscription_ready', 'security_ready', 'has_critical_issue', 'lock_version', 'created_by', 'updated_by'])]
class Organization extends Model
{
    /** @use HasFactory<OrganizationFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'established_on' => 'date',
            'data_classification' => DataClassification::class,
            'onboarding_status' => OrganizationOnboardingStatus::class,
            'account_status' => OrganizationStatus::class,
            'identity_verified' => 'boolean',
            'authority_verified' => 'boolean',
            'primary_admin_ready' => 'boolean',
            'subscription_ready' => 'boolean',
            'security_ready' => 'boolean',
            'has_critical_issue' => 'boolean',
            'activated_at' => 'datetime',
            'suspended_at' => 'datetime',
            'archived_at' => 'datetime',
            'terminated_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Organization, $this> */
    public function parent(): BelongsTo { return $this->belongsTo(self::class, 'parent_id'); }
    /** @return HasMany<Organization, $this> */
    public function children(): HasMany { return $this->hasMany(self::class, 'parent_id'); }
    /** @return HasMany<OrganizationMembership, $this> */
    public function memberships(): HasMany { return $this->hasMany(OrganizationMembership::class); }
    /** @return HasMany<OrganizationEvent, $this> */
    public function events(): HasMany { return $this->hasMany(OrganizationEvent::class); }
    /** @return HasMany<OrganizationDocument, $this> */
    public function documents(): HasMany { return $this->hasMany(OrganizationDocument::class); }
    /** @return HasMany<OrganizationSubscription, $this> */
    public function subscriptions(): HasMany { return $this->hasMany(OrganizationSubscription::class); }

    public function isActivationReady(): bool
    {
        return $this->activationBlockers() === [];
    }

    /** @return array<int, string> */
    public function activationBlockers(): array
    {
        return array_values(array_filter([
            $this->onboarding_status !== OrganizationOnboardingStatus::Approved ? 'Onboarding must be approved' : null,
            ! $this->identity_verified ? 'Official identity must be verified' : null,
            ! $this->authority_verified ? 'Administrative authority must be verified' : null,
            ! $this->primary_admin_ready ? 'Primary Organization Admin designation must be ready' : null,
            ! $this->subscription_ready ? 'Subscription readiness must be verified' : null,
            ! $this->security_ready ? 'Security configuration must be ready' : null,
            $this->has_critical_issue ? 'Critical issues must be resolved' : null,
        ]));
    }
}
