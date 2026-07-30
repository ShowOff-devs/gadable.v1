<?php

namespace App\Http\Requests\SuperAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrganizationDocumentRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->canAccessSuperAdminPortal() === true; }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['document_type' => ['required', 'string', 'max:100'], 'document' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png', 'mimetypes:application/pdf,image/jpeg,image/png']];
    }
}
