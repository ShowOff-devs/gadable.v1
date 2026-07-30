# Backend Guidelines

## General architecture

Use Laravel conventions and the repository's established patterns.

- Controllers coordinate requests and responses; keep them thin.
- Form Requests validate and authorize request data.
- Policies and middleware enforce role, organization, ownership, status, qualification, and subscription rules.
- Service or action classes perform material workflow transitions.
- Jobs handle AI processing, malware scanning, large exports, and notification delivery.
- Events and listeners may handle secondary effects, but authoritative state changes and their audit record must remain transactionally reliable.

Do not create a second backend or duplicate authentication system.

## Authorization order

For every protected read or write, evaluate relevant:

1. Authenticated account status
2. Active portal and role
3. Organization membership and scope
4. Record ownership or assignment
5. Workflow status
6. Qualification, expertise, and designation validity
7. Separation-of-duties conflict
8. Confidentiality and document permission
9. Subscription entitlement and lifecycle status
10. Requested action

Use deny-by-default behavior.

## PAP workflow

- Implement canonical status transitions in a dedicated state machine or transition service.
- Reject transitions that are invalid for the current status or actor.
- Lock authoritative submitted versions against ordinary editing.
- A revision creates a new version and preserves prior content, files, feedback, scores, and timestamps.
- Use optimistic locking where concurrent edits could overwrite authoritative data.
- Require a reason for return, cancellation, decline, override, recovery, and other high-impact actions.

## Assessment integrity

- Freeze the assessment tool version, structure, questions, weights, formulas, thresholds, and interpretations when the assessment begins.
- Compute scores on the server from the frozen snapshot.
- Evaluators may act only on assigned PAPs within active qualification and designation.
- Approvers may decide but must not edit Evaluator responses or scores.
- Divergence from the recommendation requires an authorized reason.
- Super Admin and Organization Admin must not score or make ordinary final PAP decisions.

## Transactions and idempotency

Use database transactions for multi-record authoritative operations, including:

- Submission and version locking
- Assignment
- Assessment completion
- Revision submission
- Final decision
- Subscription lifecycle transition
- File promotion after scanning
- Human acceptance of an AI draft

Use idempotency keys or equivalent safeguards for requests or jobs that may be retried. Retrying must not duplicate submissions, assignments, decisions, notifications, exports, or AI charges.

## Audit events

Material actions must record:

- Actor and active role
- Organization
- Action
- Affected entity and identifier
- Timestamp
- Previous and new state or safe structured diff
- Reason when applicable
- Request or correlation identifier
- Relevant authorization context

Audit events are append-only. Never store passwords, tokens, secrets, confidential document bodies, or unnecessarily sensitive personal data in an audit payload.

## Files

- Validate extension, MIME type, size, and content signature.
- Store new uploads in quarantine.
- Scan before promotion to protected storage.
- Use generated storage paths; do not trust user filenames as paths.
- Authorize every preview and download.
- Audit sensitive access.
- Use short-lived signed delivery where appropriate.
- Keep malicious or invalid files quarantined and inaccessible.

## AI processing

- Run AI work asynchronously.
- Record provider, model, prompt version, request status, usage, and validation outcome.
- Apply input limits and redact or exclude unnecessary private data.
- Treat output as untrusted structured input; validate it before storage or display.
- Save AI results as drafts separate from authoritative human-approved values.
- Do not allow AI failure to corrupt or partially advance PAP workflow.

## API and response behavior

- Use consistent response structures and appropriate HTTP status codes.
- Paginate potentially large collections.
- Whitelist filters and sortable columns.
- Avoid exposing internal exception messages or stack traces.
- Prevent mass-assignment of protected fields.
- Use resources or transformers to prevent accidental data leakage.
- Rate-limit authentication, public forms, exports, downloads, AI actions, and other abuse-prone endpoints.

## Backend completion checklist

- Happy path and all authorization boundaries are tested.
- Wrong organization, wrong role, wrong status, conflict, expired designation, and retry cases are rejected.
- State transition and audit record are transactionally reliable.
- Migration is reversible and preserves existing data.
- Relevant indexes and constraints exist.
- PHP formatter, static checks if configured, and focused Laravel tests pass.

