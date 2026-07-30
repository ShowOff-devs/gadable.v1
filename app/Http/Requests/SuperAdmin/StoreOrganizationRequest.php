<?php

namespace App\Http\Requests\SuperAdmin;

use App\Enums\DataClassification;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrganizationRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->canAccessSuperAdminPortal() === true; }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'official_name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'regex:/^[A-Z0-9-]+$/', 'unique:organizations,code'],
            'acronym' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:5000'],
            'website' => ['nullable', 'url:http,https', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'established_on' => ['nullable', 'date', 'before_or_equal:today'],
            'parent_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'organization_type' => ['nullable', 'string', 'max:100'],
            'geographic_scope' => ['nullable', 'string', 'max:255'],
            'region_name' => ['nullable', 'string', 'max:255'],
            'province_name' => ['nullable', 'string', 'max:255'],
            'locality_name' => ['nullable', 'string', 'max:255'],
            'address_line' => ['nullable', 'string', 'max:500'],
            'official_contact_name' => ['nullable', 'string', 'max:255'],
            'official_contact_position' => ['nullable', 'string', 'max:255'],
            'official_contact_email' => ['nullable', 'email', 'max:255'],
            'data_classification' => ['required', Rule::enum(DataClassification::class)],
            'identity_verified' => ['boolean'], 'authority_verified' => ['boolean'],
            'primary_admin_ready' => ['boolean'], 'subscription_ready' => ['boolean'],
            'security_ready' => ['boolean'], 'has_critical_issue' => ['boolean'],
            'confirm_duplicate' => ['boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['code' => strtoupper(trim((string) $this->input('code')))]);
    }
}
