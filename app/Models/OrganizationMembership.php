<?php

namespace App\Models;

use Database\Factories\OrganizationMembershipFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $organization_id
 * @property int $user_id
 * @property string $status
 * @property Carbon|null $started_at
 * @property Carbon|null $ended_at
 * @property-read Organization $organization
 * @property-read \Illuminate\Database\Eloquent\Collection<int, OrganizationAdminDesignation> $adminDesignations
 */

#[Fillable(['organization_id', 'user_id', 'status', 'started_at', 'ended_at'])]
class OrganizationMembership extends Model
{
    public const STATUS_ACTIVE = 'active';

    /** @use HasFactory<OrganizationMembershipFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['started_at' => 'datetime', 'ended_at' => 'datetime'];
    }

    /** @return BelongsTo<Organization, $this> */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<OrganizationAdminDesignation, $this> */
    public function adminDesignations(): HasMany
    {
        return $this->hasMany(OrganizationAdminDesignation::class);
    }
}
