<?php

namespace App\Http\Requests\SuperAdmin;

use App\Support\SubscriptionPlanCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreSubscriptionPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessSuperAdminPortal() === true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => Str::upper($this->string('code')->trim()->toString()),
        ]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'family' => ['required', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:150'],
            'code' => ['required', 'string', 'max:50', 'regex:/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/', Rule::unique('subscription_plans', 'code')],
            'description' => ['nullable', 'string', 'max:2000'],
            'intended_customer_type' => ['nullable', 'string', 'max:150'],
            'deployment_scope' => ['nullable', 'string', 'max:150'],
            'version_number' => ['required', 'integer', 'min:1', 'max:9999'],
            ...$this->versionRules(),
        ];
    }

    /** @return array<string, mixed> */
    protected function versionRules(): array
    {
        return [
            'billing_cycle' => ['required', Rule::in(['monthly', 'quarterly', 'annual', 'custom'])],
            'currency' => ['required', 'string', 'size:3', Rule::in(['PHP'])],
            'implementation_amount' => ['nullable', 'decimal:0,2', 'min:0'],
            'recurring_amount' => ['nullable', 'decimal:0,2', 'min:0'],
            'renewal_amount' => ['nullable', 'decimal:0,2', 'min:0'],
            'vat_rate' => ['nullable', 'decimal:0,2', 'between:0,100'],
            'vat_inclusive' => ['required', 'boolean'],
            'grace_period_days' => ['required', 'integer', 'min:0', 'max:365'],
            'price_valid_until' => ['nullable', 'date'],
            'effective_from' => ['required', 'date'],
            'effective_until' => ['nullable', 'date', 'after:effective_from'],
            'commercial_notes' => ['nullable', 'string', 'max:3000'],
            'change_summary' => ['required', 'string', 'max:1000'],
            'limits' => ['required', 'array'],
            'limits.*.state' => ['required', Rule::in(['limited', 'unlimited', 'not_included', 'custom', 'unavailable'])],
            'limits.*.value' => ['nullable', 'integer', 'min:0'],
            'limits.*.unit' => ['nullable', 'string', 'max:30'],
            'limits.*.period' => ['nullable', Rule::in(['monthly', 'quarterly', 'annual', 'term', 'none'])],
            'entitlements' => ['required', 'array'],
            'entitlements.*.state' => ['required', Rule::in(['included', 'excluded', 'limited', 'custom', 'unavailable'])],
            'entitlements.*.limit' => ['nullable', 'integer', 'min:0'],
            'support_configuration' => ['required', 'array'],
            'support_configuration.tier' => ['required', Rule::in(['standard', 'priority', 'premium', 'custom'])],
            'support_configuration.training_sessions' => ['required', 'integer', 'min:0'],
            'support_configuration.administrator_orientation' => ['required', 'boolean'],
            'support_configuration.system_health_review' => ['required', 'boolean'],
            'support_configuration.hosting_included' => ['required', 'boolean'],
            'support_configuration.backups_included' => ['required', 'boolean'],
            'support_configuration.maintenance_included' => ['required', 'boolean'],
            'support_configuration.product_updates' => ['required', 'boolean'],
            'support_configuration.email_support' => ['required', 'boolean'],
            'support_configuration.priority_support' => ['required', 'boolean'],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                foreach (array_keys($this->input('limits', [])) as $key) {
                    if (! array_key_exists($key, SubscriptionPlanCatalog::LIMITS)) {
                        $validator->errors()->add('limits', "Unknown limit key: {$key}.");
                    }
                }
                foreach (array_keys($this->input('entitlements', [])) as $key) {
                    if (! array_key_exists($key, SubscriptionPlanCatalog::ENTITLEMENTS)) {
                        $validator->errors()->add('entitlements', "Unknown entitlement key: {$key}.");
                    }
                }
                foreach ($this->input('limits', []) as $key => $limit) {
                    if (($limit['state'] ?? null) === 'limited' && ! isset($limit['value'])) {
                        $validator->errors()->add("limits.{$key}.value", 'A value is required for a limited allowance.');
                    }
                }
            },
        ];
    }
}
