# Testing and Definition of Done

## Testing strategy

Add the smallest useful automated test at the layer that owns the rule.

- Unit tests: pure calculations, status rules, value objects, and policy helpers
- Feature tests: routes, validation, authentication, authorization, tenancy, transactions, and responses
- Integration tests: storage, queues, mail, AI providers, and external services using safe fakes where appropriate
- Frontend tests: important component behavior, forms, state rendering, and accessibility interactions
- End-to-end tests: critical role workflows after the underlying feature is stable

Do not replace meaningful authorization or integration tests with snapshots alone.

## Required cases for protected features

Test applicable:

- Happy path
- Validation failure
- Unauthenticated request
- Wrong role
- Wrong organization
- Wrong owner or missing assignment
- Wrong workflow status
- Self-evaluation or approval conflict
- Evaluator and Approver conflict
- Expired qualification or designation
- Suspended or expired account, organization, or subscription
- Duplicate request or job retry
- Concurrent update
- Confidential or quarantined file access
- Audit and notification result

## Critical acceptance scenarios

1. Organization A cannot access Organization B records by list, guessed ID, route binding, download, export, job, or API.
2. A PAP owner remains blocked from evaluating or approving their own PAP even when later granted another role.
3. A new assessment-tool version does not change active or completed assessments.
4. A PAP revision preserves all earlier content, files, feedback, scores, and timestamps.
5. An Approver can decide but cannot edit Evaluator responses or scores.
6. Super Admin can monitor and perform authorized recovery but cannot score or approve an ordinary PAP.
7. Financial features contain no payment, disbursement, voucher, procurement, or liquidation transaction.
8. AI output changes no authoritative value until accepted or edited by an authorized human.
9. An expired read-only tenant can view permitted records but cannot submit a new PAP.
10. A malicious or invalid upload remains quarantined and inaccessible.
11. A retry does not duplicate an authoritative record, notification, export, or AI charge.

## Frontend QA

Verify:

- Mobile, tablet, laptop, and wide-desktop layouts
- No horizontal overflow
- Keyboard-only use
- Visible focus
- Logical headings and landmarks
- Accessible names and validation
- Non-color status cues
- Loading, empty, error, and unauthorized states
- Large currency values and long labels
- Reduced-motion behavior

## Standard verification

Determine the exact commands from `composer.json` and `package.json`, then run the available equivalents of:

- PHP formatter
- PHP static analysis, if configured
- Laravel focused tests
- Frontend formatter
- TypeScript check
- ESLint
- Frontend tests
- Production frontend build

Run the focused suite during development and the broader relevant suite before handoff.

## Definition of done

A feature is done only when:

- It maps to an approved requirement or feature ID.
- Backend authorization and organization scope are enforced.
- Database constraints and indexes support its integrity and queries.
- Material actions are audited.
- Notifications are implemented or explicitly documented as deferred.
- Loading, empty, error, and accessibility states exist.
- Relevant automated tests pass.
- Formatting, type checks, lint, and build pass for the changed scope.
- Documentation and known limitations are updated.
- No secret, confidential file, or sensitive personal data is exposed in logs or unauthorized exports.

## Handoff report

Every coding-agent completion report must state:

1. Outcome
2. Files created
3. Files modified
4. Routes or API contracts added or changed
5. Migrations and data effects
6. Authorization and tenancy controls
7. Tests and commands run with results
8. Remaining backend, policy, content, or deployment dependencies
9. Pre-existing failures not caused by the work

