<?php

namespace App\Actions\Security;

use App\Models\SecurityEvent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RecordSecurityEvent
{
    /**
     * @param  array<string, bool|int|string|null>  $context
     */
    public function handle(
        Request $request,
        string $eventType,
        string $outcome,
        ?User $user = null,
        ?string $identifier = null,
        array $context = [],
    ): SecurityEvent
    {
        return SecurityEvent::query()->create([
            'user_id' => $user?->getKey(),
            'event_type' => $eventType,
            'outcome' => $outcome,
            'identifier_hash' => $identifier === null
                ? null
                : hash('sha256', Str::lower(Str::squish($identifier))),
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 500, ''),
            'context' => $context ?: null,
        ]);
    }
}
