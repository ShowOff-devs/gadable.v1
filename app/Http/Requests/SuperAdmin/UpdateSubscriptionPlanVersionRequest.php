<?php

namespace App\Http\Requests\SuperAdmin;

class UpdateSubscriptionPlanVersionRequest extends StoreSubscriptionPlanRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            ...$this->versionRules(),
            'lock_version' => ['required', 'integer', 'min:1'],
        ];
    }
}
