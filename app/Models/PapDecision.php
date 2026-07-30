<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $organization_id
 * @property string $status
 * @property \Illuminate\Support\Carbon $decision_date
 */
#[Fillable(['organization_id', 'pap_id', 'status', 'decision_date', 'decision_reference', 'basis', 'conditions', 'conditions_due_on', 'conditions_status', 'approver_id'])]
class PapDecision extends Model
{
    /** @use HasFactory<\Database\Factories\PapDecisionFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['decision_date' => 'date', 'conditions_due_on' => 'date', 'conditions' => 'array'];
    }

    /** @return BelongsTo<Pap, $this> */
    public function pap(): BelongsTo { return $this->belongsTo(Pap::class); }
    /** @return BelongsTo<Organization, $this> */
    public function organization(): BelongsTo { return $this->belongsTo(Organization::class); }
}
