<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use LogicException;

#[Fillable(['organization_id', 'pap_financial_summary_id', 'previous_values', 'new_values', 'reason', 'authority_reference', 'effective_date', 'attested', 'prior_lock_version', 'created_by'])]
class FinancialAmendment extends Model
{
    /** @use HasFactory<\Database\Factories\FinancialAmendmentFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['previous_values' => 'array', 'new_values' => 'array', 'effective_date' => 'date', 'attested' => 'boolean'];
    }

    protected static function booted(): void
    {
        static::updating(fn () => throw new LogicException('Financial amendments are append-only.'));
        static::deleting(fn () => throw new LogicException('Financial amendments cannot be deleted.'));
    }
}
