<?php

namespace App\Models;

use Database\Factories\OrganizationAdminDesignationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property Carbon $effective_at
 * @property Carbon|null $expires_at
 * @property Carbon|null $authority_documented_at
 * @property Carbon|null $revoked_at
 * @property int $id
 * @property string $status
 */
#[Fillable(['organization_membership_id', 'status', 'effective_at', 'expires_at', 'authority_documented_at', 'revoked_at'])]
class OrganizationAdminDesignation extends Model
{
    public const STATUS_ACTIVE = 'active';

    /** @use HasFactory<OrganizationAdminDesignationFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'effective_at' => 'datetime',
            'expires_at' => 'datetime',
            'authority_documented_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<OrganizationMembership, $this> */
    public function membership(): BelongsTo
    {
        return $this->belongsTo(OrganizationMembership::class, 'organization_membership_id');
    }

    public function isCurrentlyValid(): bool
    {
        return $this->status === self::STATUS_ACTIVE
            && $this->authority_documented_at !== null
            && $this->revoked_at === null
            && ! $this->effective_at->isFuture()
            && ($this->expires_at === null || $this->expires_at->isFuture());
    }
}
