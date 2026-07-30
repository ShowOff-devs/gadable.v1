# GADable Project Baseline

## Product purpose

GADable is a multi-organization, role-based platform for submitting, reviewing, evaluating, approving, monitoring, and reporting Gender and Development Programs, Activities, and Projects (PAPs). It also manages authorized, configurable, and versioned assessment instruments and approved institutional knowledge.

The initial architecture is Mindanao-first and must be capable of future Philippine-wide activation.

## Operational roles

| Role | Primary responsibility | Scope |
|---|---|---|
| Proponent / PAP Submitter | Prepare, submit, revise, and monitor PAPs | Own or explicitly delegated records within the organization |
| Evaluator / GFPS Member | Evaluate assigned PAPs and provide evidence-based findings | Assigned PAPs within active qualification, expertise, and designation |
| Approver / GFPS Chairperson | Perform final organizational review and decision | PAPs routed for approval within the authorized scope |
| Organization Administrator | Operate an organization workspace | One organization and its authorized units |
| Platform Super Administrator | Govern the platform, tenants, security, tools, and subscriptions | Platform-wide administration without ordinary PAP decision authority |

A person may hold multiple roles, but every action must use an explicit active role. Conflict checks are performed per PAP and assessment.

## Login portals

| Portal | Authorized users | Preferred route |
|---|---|---|
| User Sign In | Proponent, Evaluator, Approver | `/login` |
| Organization Admin Sign In | Organization Administrator | `/organization-admin/login` |
| Super Admin Sign In | Platform Super Administrator | `/super-admin/login` |

The shared user login must determine the authorized dashboard from the account's server-side role assignments. Users must not submit or select a trusted role from the browser.

## Canonical PAP workflow

`Draft -> Submitted -> Under Administrative Screening -> For Assignment -> Assigned -> Under Evaluation -> For Revision -> Evaluation Completed -> For Final Review -> Approved / Conditionally Approved / Declined / Returned -> Completed -> Archived`

`For Revision` may repeat. `Cancelled` is available only through an authorized action with a recorded reason.

Transitions must be enforced through a state machine or equivalent transition service, not arbitrary status editing.

## Assessment tools

The platform may support authorized and versioned:

- HGDG
- GMEF
- GeRL
- GFAsT-NGA
- GFAsT-LGU
- Future formally authorized instruments

Do not invent or modify official content, scoring rules, weights, thresholds, formulas, or interpretations. An assessment must retain an immutable snapshot of the exact tool version used.

## Financial boundary

GADable may summarize:

- Requested amount
- Recommended amount
- Approved or allotted amount
- GAD-attributed amount or percentage
- Released, obligated, and utilized amounts when included in the approved reporting scope
- Variance and aggregate financial indicators

GADable must not implement fund transfers, payments, accounting ledgers, procurement, vouchers, liquidation, payroll, or banking operations.

The organization-level 5% GAD budget benchmark is computed only when an authorized annual budget baseline exists. It is not automatically applied to every PAP and is not treated as a transfer to PCW.

## AI boundary

AI may assist with:

- Text extraction
- Summarization
- Classification suggestions
- Document comparison
- Missing-information detection
- Draft insights or recommendations

AI results remain drafts until an authorized human validates them. AI never issues the official assessment score, approval decision, signature, or publication decision.

## Subscription boundary

The platform supports plans, versioned entitlements, usage allowances, contract records, renewals, grace periods, suspension, expiration, and audited lifecycle actions. It is not an online payment processor.

Prices and plan limits are controlled commercial data. Do not change them without an approved source.

## Initial release exclusions

Unless separately approved, do not add:

- Public self-registration
- Online checkout or payment gateway
- Participating-organization claims or logos
- Automated final AI decisions
- Unapproved assessment content
- Cross-tenant operational access
- Hard deletion of authoritative history

