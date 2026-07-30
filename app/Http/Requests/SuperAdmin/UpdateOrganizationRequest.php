<?php

namespace App\Http\Requests\SuperAdmin;

use App\Models\Organization;
use Illuminate\Validation\Rule;

class UpdateOrganizationRequest extends StoreOrganizationRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $organization = $this->route('organization');

        return [
            ...parent::rules(),
            'code' => ['required', 'string', 'max:50', 'regex:/^[A-Z0-9-]+$/', Rule::unique('organizations')->ignore($organization)],
            'parent_id' => ['nullable', 'integer', 'exists:organizations,id', Rule::notIn([$organization instanceof Organization ? $organization->id : null])],
            'lock_version' => ['required', 'integer', 'min:1'],
            'hierarchy_reason' => ['nullable', 'string', 'min:10', 'max:2000'],
        ];
    }
}
