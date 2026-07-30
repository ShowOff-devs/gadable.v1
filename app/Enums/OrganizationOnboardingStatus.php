<?php

namespace App\Enums;

use App\Contracts\LabelledEnum;

enum OrganizationOnboardingStatus: string implements LabelledEnum
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case UnderReview = 'under_review';
    case ForClarification = 'for_clarification';
    case Verified = 'verified';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return str($this->value)->headline()->toString();
    }
}
