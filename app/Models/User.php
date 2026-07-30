<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string $account_type
 * @property string $account_status
 * @property-read \Illuminate\Database\Eloquent\Collection<int, OrganizationMembership> $organizationMemberships
 * @property-read \Illuminate\Database\Eloquent\Collection<int, SecurityEvent> $securityEvents
 */
#[Fillable(['name', 'email', 'password', 'account_type', 'account_status'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    public const ACCOUNT_TYPE_SUPER_ADMIN = 'super_admin';
    public const ACCOUNT_TYPE_ORGANIZATION_ADMIN = 'organization_admin';

    public const STATUS_ACTIVE = 'active';

    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function canAccessSuperAdminPortal(): bool
    {
        return $this->account_type === self::ACCOUNT_TYPE_SUPER_ADMIN
            && $this->account_status === self::STATUS_ACTIVE;
    }

    public function hasConfirmedTwoFactorAuthentication(): bool
    {
        return filled($this->two_factor_secret)
            && $this->two_factor_confirmed_at !== null;
    }

    /** @return HasMany<OrganizationMembership, $this> */
    public function organizationMemberships(): HasMany
    {
        return $this->hasMany(OrganizationMembership::class);
    }

    /** @return HasMany<SecurityEvent, $this> */
    public function securityEvents(): HasMany
    {
        return $this->hasMany(SecurityEvent::class);
    }

    public function canAttemptOrganizationAdminPortal(): bool
    {
        return $this->account_type === self::ACCOUNT_TYPE_ORGANIZATION_ADMIN
            && $this->account_status === self::STATUS_ACTIVE
            && $this->email_verified_at !== null;
    }
}
