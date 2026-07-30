<?php

use Inertia\Testing\AssertableInertia as Assert;

test('renders the public GADable landing page', function () {
    $response = $this->get(route('home'));

    $response
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
        );
});
