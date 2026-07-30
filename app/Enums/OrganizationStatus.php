<?php

namespace App\Enums;

use App\Contracts\LabelledEnum;

enum OrganizationStatus: string implements LabelledEnum
{
    case PendingActivation = 'pending_activation';
    case Active = 'active';
    case Restricted = 'restricted';
    case Suspended = 'suspended';
    case Archived = 'archived';
    case Terminated = 'terminated';

    public function label(): string
    {
        return str($this->value)->headline()->toString();
    }
}
