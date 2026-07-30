# Authentication, Tenancy, and Security

## Portal separation

GADable uses three login entry points:

| Portal | Roles | Route |
|---|---|---|
| User Sign In | Proponent, Evaluator, Approver | `/login` |
| Organization Admin Sign In | Organization Administrator | `/organization-admin/login` |
| Super Admin Sign In | Platform Super Administrator | `/super-admin/login` |

Use a shared secure Laravel authentication foundation where practical, with separate entry pages and post-login authorization.

- Do not trust a role submitted by a login form.
- Do not require operational users to choose Proponent, Evaluator, or Approver during login.
- Determine available roles and the destination from server-side assignments.
- Do not reveal that an email belongs to another portal.
- Redirect authenticated users only to an authorized dashboard.

## Suggested protected route groups

Use the repository's actual naming conventions, but maintain equivalent boundaries:

- `/proponent/*`
- `/evaluator/*`
- `/approver/*`
- `/organization-admin/*`
- `/super-admin/*`

Every route group requires authentication plus role and organization middleware as applicable. Policies must still authorize the specific record and action.

## Organization isolation

- Every organization-bound account has an active membership.
- Resolve organization context on the server.
- Never accept an arbitrary organization ID as authority.
- Scope list queries before applying filters, sorting, or pagination.
- Use scoped route binding or an equivalent policy-protected lookup.
- Queue jobs, notifications, exports, caches, file paths, and audit events must retain organization context.
- Cross-organization aggregation is available only through explicitly authorized reporting.

A user from Organization A must not list, guess, view, edit, download, export, or act on Organization B records.

## Separation of duties

Block a user from:

- Evaluating or approving a PAP they own, co-own, submitted, or materially prepared
- Acting as both Evaluator and Approver for the same assessment
- Using Organization Admin or Super Admin privileges to bypass a conflict
- Continuing role-dependent action after a qualification or designation expires

Check conflicts per PAP or assessment, not only per account.

## Session and credential security

- Regenerate the session after successful authentication and privilege changes.
- Invalidate the session and CSRF state on logout.
- Rate-limit and audit failed administrative login attempts.
- Use time-limited, single-use password-reset tokens.
- Never use birthdays as an authentication factor.
- Do not email reusable temporary passwords.
- Support session listing, expiration, revocation, and sign-out from other sessions.
- Revoke affected sessions when an account, membership, role, organization, or subscription is suspended.

## MFA

- Support MFA for organization-required roles.
- Require MFA for Super Admin.
- Strongly enforce or require MFA for Organization Admin based on the approved policy.
- Require recent authentication and MFA confirmation for high-risk privileged actions.

## Subscription lifecycle

Enforce lifecycle status in middleware or policies and again in sensitive action authorization.

- Active: permitted features within plan entitlements and quotas
- Grace: behavior follows the approved plan policy
- Suspended or expired read-only: permitted records may be viewed, but new PAP submission and other restricted writes are blocked
- Reactivation: requires an authorized, audited lifecycle action

The Super Admin interface must not silently bypass subscription restrictions.

## Web security baseline

- CSRF protection for session-authenticated writes
- Secure, HttpOnly, SameSite cookies
- TLS in deployed environments
- Secure headers and a reviewed Content Security Policy
- Strict validation and safe output encoding
- Rate limiting
- Secret management outside source control
- Dependency and vulnerability scanning
- Sensitive-log redaction
- Malware scanning and file quarantine
- Penetration testing before production and after material high-risk changes

## Privacy

- Collect and expose only necessary information.
- Apply confidentiality classifications and authorized disclosure rules.
- Mask or suppress aggregates that could re-identify small groups.
- Provide retention, legal hold, and data-subject handling according to approved policy.
- Do not let ordinary administrators erase audit or legal history.

