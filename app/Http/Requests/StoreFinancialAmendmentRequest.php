<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreFinancialAmendmentRequest extends FormRequest
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
            'lock_version' => ['required', 'integer', 'min:1'],
            'changes' => ['required', 'array', 'min:1'],
            'changes.approved_amount' => ['sometimes', 'nullable', 'decimal:0,2', 'min:0', 'max:999999999999.99'],
            'changes.recommended_amount' => ['sometimes', 'nullable', 'decimal:0,2', 'min:0', 'max:999999999999.99'],
            'changes.gad_attributed_amount' => ['sometimes', 'nullable', 'decimal:0,2', 'min:0', 'max:999999999999.99'],
            'changes.financial_status' => ['sometimes', 'in:proposed,under_review,approved,partially_approved,declined,completed,cancelled'],
            'changes.remarks' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'reason' => ['required', 'string', 'min:10', 'max:5000'],
            'authority_reference' => ['required', 'string', 'max:255'],
            'effective_date' => ['required', 'date'],
            'attested' => ['accepted'],
        ];
    }
}
