<?php

namespace App\Actions\OrganizationAdmin;

use App\Models\Pap;
use App\Models\PapFinancialSummary;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SavePapFinancialSummary
{
    /** @param array<string, mixed> $data */
    public function handle(Pap $pap, User $actor, array $data): PapFinancialSummary
    {
        $decision = $pap->decision;

        if ($decision === null || ! in_array($decision->status, ['approved', 'conditionally_approved'], true)) {
            throw ValidationException::withMessages(['pap' => 'Only a PAP with an authoritative approved decision can receive a financial summary.']);
        }

        if ((int) $decision->organization_id !== (int) $pap->organization_id) {
            throw ValidationException::withMessages(['pap' => 'The PAP decision is outside the organization scope.']);
        }

        if ($data['attribution_method'] === 'percentage_based') {
            $data['gad_attributed_amount'] = $this->percentageAmount(
                (string) $data['attribution_base_amount'],
                (string) $data['attribution_percentage'],
            );
        } elseif ($data['attribution_method'] === 'not_applicable') {
            $data['gad_attributed_amount'] = '0.00';
        }

        return DB::transaction(fn () => PapFinancialSummary::query()->create([
            ...$data,
            'organization_id' => $pap->organization_id,
            'pap_id' => $pap->id,
            'pap_decision_id' => $decision->id,
            'created_by' => $actor->id,
            'updated_by' => $actor->id,
        ]));
    }

    private function percentageAmount(string $amount, string $percentage): string
    {
        $cents = $this->scaledInteger($amount, 2);
        $basisPoints = $this->scaledInteger($percentage, 4);
        $result = intdiv(($cents * $basisPoints) + 500000, 1000000);

        return sprintf('%d.%02d', intdiv($result, 100), $result % 100);
    }

    private function scaledInteger(string $value, int $scale): int
    {
        [$whole, $fraction] = array_pad(explode('.', $value, 2), 2, '');

        return ((int) $whole * (10 ** $scale)) + (int) str_pad(substr($fraction, 0, $scale), $scale, '0');
    }
}
