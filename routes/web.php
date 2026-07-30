<?php

use App\Http\Controllers\SuperAdmin\AuthenticatedSessionController as SuperAdminAuthenticatedSessionController;
use App\Http\Controllers\SuperAdmin\TwoFactorChallengeController as SuperAdminTwoFactorChallengeController;
use App\Http\Controllers\SuperAdmin\UserAccessController;
use App\Http\Controllers\SuperAdmin\PlatformDashboardController;
use App\Http\Controllers\SuperAdmin\OrganizationController;
use App\Http\Controllers\SuperAdmin\OrganizationDocumentController;
use App\Http\Controllers\SuperAdmin\OrganizationOnboardingTransitionController;
use App\Http\Controllers\SuperAdmin\OrganizationStatusTransitionController;
use App\Http\Controllers\SuperAdmin\SubscriptionController;
use App\Http\Controllers\SuperAdmin\SubscriptionPlanController;
use App\Http\Controllers\SuperAdmin\SubscriptionPlanVersionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrganizationAdmin\AuthenticatedSessionController as OrganizationAdminAuthenticatedSessionController;
use App\Http\Controllers\OrganizationAdmin\DashboardController as OrganizationAdminDashboardController;
use App\Http\Controllers\OrganizationAdmin\OrganizationContextController;
use App\Http\Controllers\OrganizationAdmin\TwoFactorChallengeController as OrganizationAdminTwoFactorChallengeController;
use App\Http\Controllers\OrganizationAdmin\ApprovedPapController;
use App\Http\Controllers\OrganizationAdmin\ApprovedPapExportController;
use App\Http\Controllers\OrganizationAdmin\FinancialAmendmentController;
use App\Http\Controllers\OrganizationAdmin\OrganizationBudgetBaselineController;
use App\Http\Controllers\OrganizationAdmin\PapFinancialSummaryController;
use App\Http\Controllers\OrganizationAdmin\ReportsAnalyticsController;
use App\Http\Controllers\OrganizationAdmin\ReportsAnalyticsExportController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard', [
        'dashboard' => null,
        'previewMode' => app()->isLocal(),
    ])->name('dashboard');
});

require __DIR__.'/settings.php';

Route::prefix('organization-admin')->name('organization-admin.')->group(function () {
    Route::get('login', [OrganizationAdminAuthenticatedSessionController::class, 'create'])
        ->name('login');
    Route::post('login', [OrganizationAdminAuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:organization-admin-login')
        ->name('login.store');
    Route::get('two-factor-challenge', [OrganizationAdminTwoFactorChallengeController::class, 'create'])
        ->name('two-factor.challenge');
    Route::post('two-factor-challenge', [OrganizationAdminTwoFactorChallengeController::class, 'store'])
        ->middleware('throttle:organization-admin-two-factor')
        ->name('two-factor.authenticate');

    Route::middleware('organization-admin')->group(function () {
        Route::get('organizations/select', [OrganizationContextController::class, 'create'])
            ->name('organizations.select');
        Route::post('organizations/select', [OrganizationContextController::class, 'store'])
            ->name('organizations.store');
        Route::middleware('organization-subscription')->group(function () {
            Route::get('dashboard', OrganizationAdminDashboardController::class)
                ->name('dashboard');
            Route::get('approved-paps', [ApprovedPapController::class, 'index'])->name('approved-paps.index');
            Route::get('approved-paps/export', ApprovedPapExportController::class)->name('approved-paps.export');
            Route::get('approved-paps/{pap}', [ApprovedPapController::class, 'show'])->name('approved-paps.show');
            Route::get('reports-analytics', ReportsAnalyticsController::class)
                ->middleware('throttle:60,1')
                ->name('reports-analytics.index');
            Route::get('reports-analytics/export', ReportsAnalyticsExportController::class)
                ->middleware('throttle:10,1')
                ->name('reports-analytics.export');
            Route::middleware('organization-subscription-write')->group(function () {
                Route::post('approved-paps/{pap}/financial-summary', [PapFinancialSummaryController::class, 'store'])->name('approved-paps.financial-summary.store');
                Route::post('approved-paps/{pap}/financial-summary/amendments', [FinancialAmendmentController::class, 'store'])->name('approved-paps.financial-summary.amendments.store');
                Route::post('budget-baselines', [OrganizationBudgetBaselineController::class, 'store'])->name('budget-baselines.store');
            });
        });
        Route::post('logout', [OrganizationAdminAuthenticatedSessionController::class, 'destroy'])
            ->name('logout');
    });
});

Route::prefix('super-admin')->name('super-admin.')->group(function () {
    Route::get('login', [SuperAdminAuthenticatedSessionController::class, 'create'])
        ->name('login');
    Route::post('login', [SuperAdminAuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:super-admin-login')
        ->name('authenticate');
    Route::get('two-factor-challenge', [SuperAdminTwoFactorChallengeController::class, 'create'])
        ->name('two-factor.challenge');
    Route::post('two-factor-challenge', [SuperAdminTwoFactorChallengeController::class, 'store'])
        ->middleware('throttle:super-admin-two-factor')
        ->name('two-factor.authenticate');
    Route::middleware('super-admin')->group(function () {
        Route::get('dashboard', PlatformDashboardController::class)
            ->name('dashboard');
        Route::resource('organizations', OrganizationController::class)->except('destroy');
        Route::get('users', [UserAccessController::class, 'index'])
            ->name('users.index');
        Route::get('users/{user}', [UserAccessController::class, 'show'])
            ->name('users.show');
        Route::get('subscriptions', [SubscriptionController::class, 'index'])
            ->name('subscriptions.index');
        Route::get('subscriptions/plans', [SubscriptionPlanController::class, 'index'])
            ->name('subscription-plans.index');
        Route::get('subscriptions/plans/create', [SubscriptionPlanController::class, 'create'])
            ->name('subscription-plans.create');
        Route::post('subscriptions/plans', [SubscriptionPlanController::class, 'store'])
            ->name('subscription-plans.store');
        Route::get('subscriptions/plans/{plan}', [SubscriptionPlanController::class, 'show'])
            ->name('subscription-plans.show');
        Route::get('subscriptions/plans/{plan}/versions/{version}', [SubscriptionPlanVersionController::class, 'show'])
            ->name('subscription-plan-versions.show');
        Route::get('subscriptions/plans/{plan}/versions/{version}/edit', [SubscriptionPlanVersionController::class, 'edit'])
            ->name('subscription-plan-versions.edit');
        Route::put('subscriptions/plans/{plan}/versions/{version}', [SubscriptionPlanVersionController::class, 'update'])
            ->name('subscription-plan-versions.update');
        Route::post('subscriptions/plans/{plan}/versions/{version}/validate', [SubscriptionPlanVersionController::class, 'validateVersion'])
            ->name('subscription-plan-versions.validate');
        Route::post('subscriptions/plans/{plan}/versions/{version}/publish', [SubscriptionPlanVersionController::class, 'publish'])
            ->name('subscription-plan-versions.publish');
        Route::post('subscriptions/plans/{plan}/versions/{version}/clone', [SubscriptionPlanVersionController::class, 'cloneVersion'])
            ->name('subscription-plan-versions.clone');
        Route::post('subscriptions/plans/{plan}/versions/{version}/retire', [SubscriptionPlanVersionController::class, 'retire'])
            ->name('subscription-plan-versions.retire');
        Route::get('subscriptions/{subscription}', [SubscriptionController::class, 'show'])
            ->name('subscriptions.show');
        Route::post('organizations/{organization}/onboarding-transition', OrganizationOnboardingTransitionController::class)
            ->name('organizations.onboarding-transition');
        Route::post('organizations/{organization}/status-transition', OrganizationStatusTransitionController::class)
            ->name('organizations.status-transition');
        Route::post('organizations/{organization}/documents', [OrganizationDocumentController::class, 'store'])
            ->name('organizations.documents.store');
        Route::post('logout', [SuperAdminAuthenticatedSessionController::class, 'destroy'])
            ->name('logout');
    });
});
