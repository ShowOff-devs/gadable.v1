<?php

namespace App\Support;

class SubscriptionPlanCatalog
{
    /** @var array<string, string> */
    public const LIMITS = [
        'organizations' => 'Organizations',
        'internal_units' => 'Internal organizational units',
        'named_users' => 'Named users',
        'evaluators_approvers' => 'Evaluators and Approvers',
        'pap_submissions' => 'PAP submissions per year',
        'assessments' => 'Assessments per year',
        'storage_bytes' => 'Storage',
        'ai_analyses' => 'AI analyses per year',
        'exports' => 'Export allowance',
        'api_requests' => 'API requests',
        'training_sessions' => 'Training sessions',
        'environments' => 'Environments',
    ];

    /** @var array<string, string> */
    public const ENTITLEMENTS = [
        'pap_repository' => 'PAP repository',
        'basic_evaluation_workflow' => 'Basic evaluation workflow',
        'complete_evaluation_workflow' => 'Complete evaluation workflow',
        'hgdg_assessment' => 'HGDG assessment',
        'gmef_assessment' => 'GMEF assessment',
        'gerl_assessment' => 'GeRL assessment',
        'gfast_assessment' => 'GFAsT assessment',
        'configurable_scorecards' => 'Configurable scorecards',
        'expertise_based_assignment' => 'Expertise-based assignment',
        'evaluator_workload_monitoring' => 'Evaluator workload monitoring',
        'multi_stage_approval' => 'Multi-stage approval',
        'revision_cycles' => 'Revision cycles',
        'evaluation_history' => 'Evaluation history',
        'ai_assisted_analysis' => 'AI-assisted analysis',
        'pap_implementation_monitoring' => 'PAP implementation monitoring',
        'financial_summary_reporting' => 'Financial summary reporting',
        'advanced_analytics' => 'Advanced analytics',
        'pdf_export' => 'PDF export',
        'csv_export' => 'CSV export',
        'excel_export' => 'Excel export',
        'custom_branding' => 'Custom branding',
        'bulk_user_import' => 'Bulk user import',
        'multi_unit_management' => 'Multi-unit management',
        'delegated_unit_administration' => 'Delegated unit administration',
        'consolidated_unit_analytics' => 'Consolidated unit analytics',
        'cross_unit_comparison' => 'Cross-unit comparison',
        'api_readiness' => 'API readiness',
        'sso_readiness' => 'SSO readiness',
        'scheduled_reports' => 'Scheduled reports',
    ];
}
