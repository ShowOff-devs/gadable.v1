<?php

use Inertia\Testing\AssertableInertia as Assert;

it('shows the public landing page with the shared user sign in', function () {
    $this->get('/')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component('welcome'));
});

it('does not advertise administrative authentication on public pages', function () {
    $publicPageSources = [
        file_get_contents(resource_path('js/pages/welcome.tsx')),
        file_get_contents(resource_path('js/pages/auth/login.tsx')),
    ];

    $forbiddenPublicLabels = [
        'Administrative Access',
        'Organization Admin',
        'Organization Administrator',
        'Super Admin',
        'Platform Super Administrator',
        '/organization-admin/login',
        '/super-admin/login',
    ];

    foreach ($publicPageSources as $publicPageSource) {
        expect($publicPageSource)->toContain('User Sign In');

        foreach ($forbiddenPublicLabels as $forbiddenPublicLabel) {
            expect($publicPageSource)->not->toContain($forbiddenPublicLabel);
        }
    }
});
