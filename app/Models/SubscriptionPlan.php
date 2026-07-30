<?php

namespace App\Models;

use Database\Factories\SubscriptionPlanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $family
 * @property string $name
 * @property string $code
 * @property string|null $description
 * @property string|null $intended_customer_type
 * @property string|null $deployment_scope
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, SubscriptionPlanEvent> $events
 * @property-read \Illuminate\Database\Eloquent\Collection<int, SubscriptionPlanVersion> $versions
 */
#[Fillable(['family', 'name', 'code', 'description', 'intended_customer_type', 'deployment_scope', 'is_active', 'created_by'])]
class SubscriptionPlan extends Model
{
    /** @use HasFactory<SubscriptionPlanFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    /** @return HasMany<SubscriptionPlanVersion, $this> */
    public function versions(): HasMany
    {
        return $this->hasMany(SubscriptionPlanVersion::class);
    }

    /** @return HasMany<SubscriptionPlanEvent, $this> */
    public function events(): HasMany
    {
        return $this->hasMany(SubscriptionPlanEvent::class);
    }
}
