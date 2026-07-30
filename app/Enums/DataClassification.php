<?php

namespace App\Enums;

use App\Contracts\LabelledEnum;

enum DataClassification: string implements LabelledEnum
{
    case Standard = 'standard';
    case Internal = 'internal';
    case Confidential = 'confidential';
    case Restricted = 'restricted';

    public function label(): string
    {
        return str($this->value)->headline()->toString();
    }
}
