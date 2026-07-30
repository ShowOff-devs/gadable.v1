<?php

namespace App\Http\Requests\SuperAdmin;

use Illuminate\Foundation\Http\FormRequest;

class TransitionOrganizationRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->canAccessSuperAdminPortal() === true; }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['target' => ['required', 'string', 'max:50'], 'reason' => ['required', 'string', 'min:10', 'max:2000'], 'lock_version' => ['required', 'integer', 'min:1']];
    }
}
