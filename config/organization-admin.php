<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Organization Admin multi-factor authentication
    |--------------------------------------------------------------------------
    |
    | Keep this enabled in deployed environments. Local demo environments may
    | disable it explicitly without removing the production MFA workflow.
    |
    */
    'mfa_required' => (bool) env('ORGANIZATION_ADMIN_MFA_REQUIRED', true),
];
