# Frontend Guidelines

## Scope and architecture

Use Laravel, Inertia.js, React, TypeScript, Tailwind CSS, and Vite as one application.

- Do not install Next.js.
- Use Laravel routes and controllers to render Inertia pages.
- Use Inertia `Link` for internal application navigation.
- Reuse the existing component, layout, form, and page conventions.
- Do not duplicate server business rules in the browser as the only enforcement.

## Design direction

The interface must look simple, professional, trustworthy, and appropriate for government agencies, LGUs, educational institutions, and other organizations.

Use:

- White and soft-neutral backgrounds
- Generous whitespace
- Clear heading hierarchy
- Restrained use of brand colors
- Light borders and subtle shadows
- Consistent spacing and form controls
- Two- or three-column desktop grids that stack naturally on mobile

Avoid:

- Excessive gradients or animation
- Glassmorphism, neon colors, and heavy shadows
- Decorative elements without a functional purpose
- Crowded navigation
- Unverified metrics or client claims
- Large amounts of purple in every section

## Brand tokens

| Token | Value | Intended use |
|---|---|---|
| Primary purple | `#6B087F` | Primary actions, selected states, limited headings |
| Brand magenta | `#C20AA5` | Restrained highlights |
| Deep purple | `#4C075E` | High-contrast areas and footer |
| Main text | `#17151A` | Primary content |
| Muted text | `#655E69` | Supporting content |
| Soft background | `#FAF7FB` | Alternate sections |
| Border | `#E8DFEA` | Dividers and card borders |
| White | `#FFFFFF` | Main surfaces |

Prefer repository design tokens or CSS variables over repeated raw color values.

## Component rules

- Build cohesive, reusable components without splitting every small element into its own file.
- Keep page-specific components near their page unless reused across modules.
- Use a shared application shell for authenticated roles where appropriate.
- Use separate, visually related login layouts for User, Organization Admin, and Super Admin portals.
- Keep administrative access less prominent than the main User Sign In action on the public page.
- Use icons only when they improve recognition; every icon-only control needs an accessible name.

## Page-state requirements

Every data-driven screen must account for:

- Initial loading
- Empty result
- Validation error
- General request error
- Unauthorized or unavailable action
- Success feedback
- Long content and large currency values
- Pagination, filtering, and no-results state when lists can grow

Do not simulate successful actions when the backend is unavailable. Show a clear unavailable or configuration-needed state.

## Forms

- Use server-provided validation messages.
- Associate every input with a visible label.
- Preserve input after validation failure when safe.
- Mark required fields in text, not color alone.
- Show an error summary for complex forms.
- Confirm destructive or high-impact actions.
- Prevent duplicate submission while a request is pending.
- Never trust a role, organization ID, price, permission, or computed authoritative value supplied by the browser.

## Accessibility

- Use semantic landmarks and a logical heading order.
- Use one `h1` per page.
- Ensure all functions work with a keyboard.
- Provide visible focus styles.
- Maintain WCAG-friendly color contrast.
- Do not use color as the only status indicator.
- Use accessible dialog focus management.
- Provide meaningful alternative text.
- Respect `prefers-reduced-motion`.
- Ensure validation and live status messages can be announced by assistive technology.

## Responsive behavior

Verify at minimum:

- Mobile: 360-390 px
- Tablet: 768 px
- Laptop: 1280-1440 px
- Wide desktop: 1920 px

There must be no horizontal overflow. Navigation, tables, cards, forms, and currency values must remain usable at every target width.

## Frontend completion checklist

- UI matches authorized scope and role terminology.
- Restricted actions are omitted or disabled for usability, while the server remains authoritative.
- Loading, empty, error, and unauthorized states exist.
- Keyboard and responsive behavior are verified.
- TypeScript, lint, tests, formatter, and production build pass for the changed scope.

