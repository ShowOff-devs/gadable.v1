<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['organization_id', 'fiscal_year', 'currency', 'total_annual_budget', 'approved_gad_budget', 'source_reference', 'approval_date', 'remarks', 'verified_by', 'verified_at', 'lock_version', 'created_by', 'updated_by'])]
class OrganizationBudgetBaseline extends Model
{
    /** @use HasFactory<\Database\Factories\OrganizationBudgetBaselineFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['fiscal_year' => 'integer', 'total_annual_budget' => 'decimal:2', 'approved_gad_budget' => 'decimal:2', 'approval_date' => 'date', 'verified_at' => 'datetime', 'lock_version' => 'integer'];
    }
}
