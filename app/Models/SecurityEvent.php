<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $event_type
 * @property string $outcome
 * @property \Illuminate\Support\Carbon|null $created_at
 */

#[Fillable([
    'user_id',
    'event_type',
    'outcome',
    'identifier_hash',
    'ip_address',
    'user_agent',
    'context',
])]
class SecurityEvent extends Model
{
    protected function casts(): array
    {
        return [
            'context' => 'array',
        ];
    }
}
