<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** @property int $id @property int $organization_id @property string|null $requested_amount @property string|null $approved_amount @property string|null $gad_attributed_amount @property string $financial_status */
#[Fillable(['organization_id', 'pap_id', 'pap_decision_id', 'fiscal_year', 'currency', 'total_pap_cost', 'requested_amount', 'recommended_amount', 'approved_amount', 'gad_classification', 'attribution_method', 'attribution_percentage', 'attribution_base_amount', 'gad_attributed_amount', 'attribution_basis', 'funding_source', 'funding_details', 'approval_date', 'financial_status', 'official_reference', 'remarks', 'verified_by', 'verified_at', 'lock_version', 'created_by', 'updated_by'])]
class PapFinancialSummary extends Model
{
    /** @use HasFactory<\Database\Factories\PapFinancialSummaryFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'approval_date' => 'date', 'verified_at' => 'datetime', 'fiscal_year' => 'integer',
            'total_pap_cost' => 'decimal:2', 'requested_amount' => 'decimal:2',
            'recommended_amount' => 'decimal:2', 'approved_amount' => 'decimal:2',
            'attribution_percentage' => 'decimal:4', 'attribution_base_amount' => 'decimal:2',
            'gad_attributed_amount' => 'decimal:2', 'lock_version' => 'integer',
        ];
    }

    /** @return BelongsTo<Pap, $this> */
    public function pap(): BelongsTo { return $this->belongsTo(Pap::class); }
    /** @return BelongsTo<PapDecision, $this> */
    public function decision(): BelongsTo { return $this->belongsTo(PapDecision::class, 'pap_decision_id'); }
    /** @return HasMany<FinancialAmendment, $this> */
    public function amendments(): HasMany { return $this->hasMany(FinancialAmendment::class); }
}
