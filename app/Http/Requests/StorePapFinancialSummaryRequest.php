<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePapFinancialSummaryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $money = ['nullable', 'decimal:0,2', 'min:0', 'max:999999999999.99'];

        return [
            'fiscal_year' => ['required', 'integer', 'between:2000,2200'],
            'currency' => ['required', 'in:PHP'],
            'total_pap_cost' => $money, 'requested_amount' => $money,
            'recommended_amount' => $money, 'approved_amount' => $money,
            'gad_classification' => ['required', 'in:direct_gad,attributable_regular_program,not_yet_classified'],
            'attribution_method' => ['required', 'in:percentage_based,direct_amount,not_applicable,not_yet_available'],
            'attribution_percentage' => ['nullable', 'decimal:0,4', 'between:0,100', 'required_if:attribution_method,percentage_based'],
            'attribution_base_amount' => ['nullable', 'decimal:0,2', 'min:0', 'max:999999999999.99', 'required_if:attribution_method,percentage_based'],
            'gad_attributed_amount' => ['nullable', 'decimal:0,2', 'min:0', 'max:999999999999.99', 'required_if:attribution_method,direct_amount'],
            'attribution_basis' => ['nullable', 'string', 'max:5000'],
            'funding_source' => ['nullable', 'string', 'max:255'],
            'funding_details' => ['nullable', 'string', 'max:5000'],
            'approval_date' => ['required', 'date'],
            'financial_status' => ['required', 'in:proposed,under_review,approved,partially_approved,declined,completed,cancelled'],
            'official_reference' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
