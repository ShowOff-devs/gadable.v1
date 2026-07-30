<?php

namespace App\Enums;

use App\Contracts\LabelledEnum;

enum SubscriptionStatus: string implements LabelledEnum
{
    case Draft = 'draft';
    case Trial = 'trial';
    case Scheduled = 'scheduled';
    case Active = 'active';
    case Grace = 'grace';
    case ReadOnly = 'read_only';
    case Suspended = 'suspended';
    case Expired = 'expired';
    case Cancelled = 'cancelled';
    case Terminated = 'terminated';

    public function label(): string
    {
        return str($this->value)->headline()->toString();
    }

}
