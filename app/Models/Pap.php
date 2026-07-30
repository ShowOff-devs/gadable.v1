<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $organization_id
 * @property string $reference
 * @property string $title
 * @property int $fiscal_year
 * @property-read PapDecision|null $decision
 * @property-read PapFinancialSummary|null $financialSummary
 */
#[Fillable(['organization_id', 'reference', 'title', 'fiscal_year', 'pap_type', 'implementing_unit', 'gad_sector', 'funding_source', 'workflow_status', 'requested_amount', 'total_pap_cost', 'created_by', 'updated_by'])]
class Pap extends Model
{
    /** @use HasFactory<\Database\Factories\PapFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['fiscal_year' => 'integer', 'requested_amount' => 'decimal:2', 'total_pap_cost' => 'decimal:2'];
    }

    /** @return BelongsTo<Organization, $this> */
    public function organization(): BelongsTo { return $this->belongsTo(Organization::class); }
    /** @return HasOne<PapDecision, $this> */
    public function decision(): HasOne { return $this->hasOne(PapDecision::class); }
    /** @return HasOne<PapFinancialSummary, $this> */
    public function financialSummary(): HasOne { return $this->hasOne(PapFinancialSummary::class); }
}
