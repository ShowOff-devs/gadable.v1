<?php

namespace App\Actions\SuperAdmin\Subscriptions;

use App\Models\SubscriptionPlanVersion;

class ValidateSubscriptionPlanVersion
{
    public const VERSION = '1.0';

    /** @return array<int, array{code:string,severity:string,message:string,field:string|null,suggested_remediation:string|null}> */
    public function handle(SubscriptionPlanVersion $version): array
    {
        $results = [];

        if (blank($version->change_summary)) {
            $results[] = $this->result('missing_change_summary', 'error', 'A change summary is required.', 'change_summary', 'Describe why this version exists.');
        }
        if ($version->effective_until && $version->effective_from && $version->effective_until->lte($version->effective_from)) {
            $results[] = $this->result('invalid_effective_dates', 'error', 'The retirement date must follow the effective date.', 'effective_until', 'Choose a later retirement date.');
        }
        if ($version->implementation_amount === null && $version->recurring_amount === null) {
            $results[] = $this->result('pricing_unavailable', 'error', 'At least one standard price is required before publication.', 'recurring_amount', 'Configure an onboarding or recurring amount.');
        }
        if (($version->support_configuration['tier'] ?? null) === null) {
            $results[] = $this->result('missing_support_tier', 'error', 'Support tier is required.', 'support_configuration.tier', 'Select an approved support tier.');
        }
        if ($version->entitlements === []) {
            $results[] = $this->result('missing_entitlements', 'error', 'At least one explicit entitlement state is required.', 'entitlements', 'Configure included and excluded capabilities.');
        }
        if (($version->limits ?? []) === []) {
            $results[] = $this->result('missing_limits', 'error', 'At least one explicit allowance is required.', 'limits', 'Configure limited, unlimited, excluded, or unavailable allowances.');
        }

        return $results;
    }

    /** @return array{code:string,severity:string,message:string,field:string|null,suggested_remediation:string|null} */
    private function result(string $code, string $severity, string $message, ?string $field, ?string $remediation): array
    {
        return compact('code', 'severity', 'message', 'field') + ['suggested_remediation' => $remediation];
    }
}
