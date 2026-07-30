# Database and Data Guidelines

## Required architecture

Use SQLite for current local development and PostgreSQL as the deployment system of record. GADable depends on strict relationships, transactional state changes, constraints, reporting, and auditability.

- Keep migrations, Eloquent queries, schema definitions, tests, and authoritative calculations portable between SQLite and PostgreSQL.
- Do not rely on SQLite behavior that PostgreSQL handles differently, including permissive typing, unsupported constraints, ambiguous date handling, or case-insensitive comparisons.
- Use database features supported by both engines for core behavior. Any necessary PostgreSQL-specific feature requires an approved architecture decision and a testable local-development strategy.
- Run the full migration and relevant test suite against PostgreSQL before deployment.

- Uploaded documents belong in protected object storage, not database blobs.
- Use a queue and cache for asynchronous and short-lived operational data.
- AI payloads may use JSON columns through Laravel's portable schema and casting APIs; deployed PostgreSQL may store them as `jsonb`.
- Do not introduce MongoDB or another document database unless measured requirements justify it and an architecture decision is approved.

## Core domains

| Domain | Representative entities |
|---|---|
| Identity and tenancy | users, organizations, organization_units, memberships, roles, permissions, role_assignments, designations, qualifications, sessions |
| PAP workflow | paps, pap_versions, pap_sections, participants, submissions, workflow_instances, workflow_events, revision_requests, decisions |
| Assessment | assessment_tools, tool_versions, categories, items, options, scoring_rules, assessments, assignments, responses, findings, recommendations |
| Documents | documents, document_versions, malware_scans, access_events, retention_rules |
| Financial summary | pap_financial_summaries, gad_attributions, organization_budget_baselines, financial_amendments |
| Subscription | subscription_plans, plan_versions, plan_features, organization_subscriptions, addons, usage, billing_records, subscription_documents, subscription_events |
| AI | ai_providers, ai_models, prompt_versions, ai_requests, ai_results, human_validations, usage_ledger |
| Operations | notifications, delivery_attempts, audit_events, security_events, incidents, integrations, jobs, backups, feature_flags, settings |

These are domain baselines, not mandatory table names. Follow established repository naming if it preserves the same boundaries.

## Tenancy rules

Every organization-owned table must carry `organization_id` directly or have a mandatory, unambiguous foreign-key path to it.

- Add foreign keys and indexes that support scoped queries.
- Include organization scope in unique constraints where uniqueness is tenant-specific.
- Avoid global model scopes as the only protection when they may be bypassed accidentally; combine query scoping, policies, and database relationships.
- Include tenant context in cache keys, queued jobs, exports, and stored file paths.

## Integrity rules

Use:

- Foreign keys
- Check constraints where supported
- Organization-scoped unique keys
- Transactions
- Optimistic lock or version columns for concurrency-sensitive records
- Append-only event and audit tables
- Idempotency keys for retryable authoritative actions
- Soft deletion only where allowed

Do not hard-delete completed assessments, decisions, frozen tool versions in use, or audit records through ordinary application flows.

## Versioning

- A submitted PAP points to an immutable PAP version.
- A revision creates a new version; it does not overwrite the submitted version.
- An assessment points to a frozen tool-version snapshot.
- Subscription assignments point to the applicable versioned plan or entitlement set.
- Store effective and expiration dates for time-bound roles, qualifications, designations, tools, and subscriptions.

## Money and numeric data

- Store currency amounts as fixed-precision decimal or integer minor units according to the approved convention.
- Never use floating-point types for authoritative money.
- Store percentages with documented precision.
- Perform authoritative calculations on the server.
- Record the source and as-of date for approved/allotted and GAD-attributed amounts.
- Amendments create traceable records instead of silently replacing history.

## Migrations and seed data

- Migrations must be reversible when technically safe.
- Preserve existing data and use staged backfills for new non-null constraints.
- Add indexes based on actual query patterns.
- Do not place real personal, confidential, or production data in seeders.
- Keep official scorecard content out of generic demo seeders unless supplied and approved.
- Mark all demonstration content clearly.

## Data logging boundary

Do not log:

- Passwords, reset tokens, MFA secrets, API keys, or session cookies
- Full confidential documents
- Sensitive personal data not necessary for the event
- Raw private AI inputs or outputs when a safe reference is sufficient

Use entity identifiers, correlation IDs, redacted metadata, and safe structured diffs.
