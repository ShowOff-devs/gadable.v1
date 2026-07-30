<?php

namespace App\Actions\OrganizationAdmin;

use App\Models\FinancialAmendment;
use App\Models\PapFinancialSummary;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AmendPapFinancialSummary
{
    /** @param array<string, mixed> $data */
    public function handle(PapFinancialSummary $summary, User $actor, array $data): FinancialAmendment
    {
        return DB::transaction(function () use ($summary, $actor, $data): FinancialAmendment {
            $locked = PapFinancialSummary::query()->lockForUpdate()->findOrFail($summary->id);
            if ($locked->lock_version !== $data['lock_version']) {
                throw ValidationException::withMessages(['lock_version' => 'This summary changed after you opened it. Refresh before amending.']);
            }

            $allowed = ['approved_amount', 'recommended_amount', 'gad_attributed_amount', 'financial_status', 'remarks'];
            $changes = array_intersect_key($data['changes'], array_flip($allowed));
            $previous = collect($changes)->mapWithKeys(fn (mixed $value, string $key) => [$key => $locked->getAttribute($key)])->all();

            $amendment = FinancialAmendment::query()->create([
                'organization_id' => $locked->organization_id,
                'pap_financial_summary_id' => $locked->id,
                'previous_values' => $previous,
                'new_values' => $changes,
                'reason' => $data['reason'],
                'authority_reference' => $data['authority_reference'],
                'effective_date' => $data['effective_date'],
                'attested' => true,
                'prior_lock_version' => $locked->lock_version,
                'created_by' => $actor->id,
            ]);

            $locked->forceFill([...$changes, 'updated_by' => $actor->id, 'lock_version' => $locked->lock_version + 1])->save();

            return $amendment;
        });
    }
}
