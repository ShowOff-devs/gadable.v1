<?php

namespace App\Http\Requests\OrganizationAdmin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReportsAnalyticsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAttemptOrganizationAdminPortal() === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'section' => ['nullable', Rule::in(['overview', 'decisions', 'financial', 'data-quality', 'unavailable'])],
            'search' => ['nullable', 'string', 'max:150'],
            'fiscal_year' => ['nullable', 'integer', 'between:2000,2200'],
            'workflow_status' => ['nullable', Rule::in(['approved', 'conditionally_approved', 'declined', 'returned', 'completed', 'archived', 'cancelled'])],
            'decision_status' => ['nullable', Rule::in(['approved', 'conditionally_approved', 'declined', 'returned'])],
            'financial_status' => ['nullable', Rule::in(['proposed', 'under_review', 'approved', 'partially_approved', 'declined', 'completed', 'cancelled'])],
            'gad_classification' => ['nullable', Rule::in(['direct_gad', 'attributable_regular_program', 'not_yet_classified'])],
            'funding_source' => ['nullable', 'string', 'max:255'],
            'decision_from' => ['nullable', 'date'],
            'decision_to' => ['nullable', 'date', 'after_or_equal:decision_from'],
            'sort' => ['nullable', Rule::in(['reference', 'title', 'fiscal_year', 'decision_date', 'approved_amount'])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([10, 25, 50])],
        ];
    }

    /** @return array<string, mixed> */
    public function filters(): array
    {
        return array_filter($this->safe()->except(['section', 'sort', 'direction', 'per_page']), fn (mixed $value): bool => $value !== null && $value !== '' && $value !== 'all');
    }
}
