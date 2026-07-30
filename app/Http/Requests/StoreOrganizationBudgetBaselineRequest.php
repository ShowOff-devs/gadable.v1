<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrganizationBudgetBaselineRequest extends FormRequest
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
        return [
            'fiscal_year' => ['required', 'integer', 'between:2000,2200'],
            'currency' => ['required', 'in:PHP'],
            'total_annual_budget' => ['nullable', 'decimal:0,2', 'min:0', 'max:999999999999.99'],
            'approved_gad_budget' => ['nullable', 'decimal:0,2', 'min:0', 'max:999999999999.99'],
            'source_reference' => ['nullable', 'string', 'max:255'],
            'approval_date' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
