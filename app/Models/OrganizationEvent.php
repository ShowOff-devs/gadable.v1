<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $action
 * @property string $outcome
 * @property string|null $reason
 * @property string $reference
 * @property \Illuminate\Support\Carbon|null $created_at
 */
class OrganizationEvent extends Model
{
    public const UPDATED_AT = null;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['before_state' => 'array', 'after_state' => 'array'];
    }
}
