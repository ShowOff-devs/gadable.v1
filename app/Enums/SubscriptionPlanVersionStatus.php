<?php

namespace App\Enums;

use App\Contracts\LabelledEnum;

enum SubscriptionPlanVersionStatus: string implements LabelledEnum
{
    case Draft = 'draft';
    case Published = 'published';
    case Retired = 'retired';
    case Archived = 'archived';

    public function label(): string
    {
        return str($this->value)->headline()->toString();
    }

    public function isImmutable(): bool
    {
        return $this !== self::Draft;
    }
}
