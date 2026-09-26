# Campaign Module UX Redesign

**Date:** 2026-09-26  
**Status:** Draft for review  
**Stack:** Angular 22 + PrimeNG 21 (current branch)  
**Scope:** All screens under `src/app/cms/campaign/`

## Goal

Make campaign admin screens consistent, scannable, and user-friendly: fix cramped spacing and fieldset collisions, then apply a fuller UX redesign with shared layout patterns. Keep the existing data model and APIs; interaction patterns may change (collapsible sections, light stepper, sticky actions).

## Decisions (approved)

| Decision | Choice |
|---|---|
| Scope | All campaign screens (list, add/edit, related config pages) |
| Depth | Fuller UX redesign |
| Data/behavior | Same data model; interaction patterns may change |
| Approach | Pattern kit + progressive rollout |

## Non-goals

- Backend / API contract changes
- Migrating campaign screens to Spartan NG in this pass
- Changing business rules, validation logic, or form control names
- Global CMS redesign outside the campaign module (unless a shared style is required for a pattern)

## Shared pattern kit

Introduce reusable layout classes scoped under a campaign root (e.g. `.cms-campaign .cms-page`). Keep them campaign-local for this pass; do not promote to global CMS styles unless a later pass requires it.

| Pattern | Class / structure | Rules |
|---|---|---|
| Page shell | `.cms-page` + title row | Consistent card padding `1.25–1.5rem`; vertical rhythm `~1rem` between major blocks |
| Filter bar | `.cms-filter-bar` | Filters in one bordered strip; optional Clear when any filter active |
| List tools | caption / `.cms-list-tools` | Search left, primary secondary actions right |
| Form section | `.cms-form-section` | Card with clear title; **do not rely on `p-fieldset` legend overlay** for primary section chrome (use heading + bordered content to avoid collision) |
| Control row | `.cms-control-row` | Label above; radios/checkboxes/toggles as horizontal groups with aligned baselines |
| Sticky actions | `.cms-sticky-actions` | Submit / Cancel (and related) pinned at bottom of viewport while scrolling long forms |
| Table density | section styles for `p-table` | Comfortable header/cell padding; inputs inside cells not flush to borders |

### Spacing tokens (target)

- Label → control: `~0.35rem`
- Field → field (vertical): `~1rem`
- Section → section: `~1.25–1.5rem`
- Filter / tool row internal gap: `0.75–1rem`

### Long-form interaction (Add / Edit Campaign)

- **Primary pattern: collapsible sections** (`p-panel` or equivalent), with **Campaign Details** expanded by default and other sections collapsed until opened.
- On failed submit, auto-expand any section that contains invalid controls and scroll to the first error.
- WAP-only blocks remain conditionally rendered from existing form state (no change to `campaign_type` gating).
- Sticky Submit/Cancel always available; validation still runs on the full form submit (no backend change).
- A multi-step stepper is **out of scope** for this pass (can be a follow-up if collapse proves insufficient).

## Screen map

| Screen | Route(s) | Pattern | UX changes |
|---|---|---|---|
| Campaigns list | `list` | List | Filter strip + Clear; search/export row; denser table; correct pagination report |
| Add / Edit Campaign | `add`, `edit` | Long-form | Section cards via collapsible panels; sticky actions; regroup WAP checkboxes and Ad Partner toggles |
| Smart URL list + add/edit | `smart-url/*` | List + Form | Apply list/form kit |
| Landing page config list + add/edit | `landing-page-configuration/*` | List + Form | Apply list/form kit |
| Campaign theme | `theme` | Long-form | Section cards + sticky actions |
| Configuration list + add/edit | `configuration-list`, `add-configuration`, `edit-configuration` | List + Form | Apply kit |
| Blacklist / Whitelist list + add | `blacklist`, `add-blacklist`, `whitelist`, `add-whitelist` | List + Form | Apply kit |
| Service API doc | `service-api-doc` | Page shell | Title + content spacing only |

## Rollout waves

1. **Foundation** — Add shared CSS/classes; fix fieldset/table spacing collisions globally for campaign templates.
2. **Wave A** — Campaigns list + Add/Edit Campaign (highest pain; matches current screenshots).
3. **Wave B** — Smart URL, Landing page configuration.
4. **Wave C** — Theme, Configuration, Blacklist/Whitelist, Service API doc.
5. **Exit gate** — Visual check per route; `npm run build:staging` green; no form control or API regressions.

## Success criteria

- No overlapping section titles / content (especially WAP “Skip Consent” vs legend).
- Consistent grid alignment across form rows on desktop; usable stacked layout on mobile.
- List screens share the same filter → tools → table rhythm.
- Long forms keep actions reachable without scrolling to the bottom.
- Existing submit payloads and validators behave as today.

## Risks / notes

- PrimeNG 21 fieldset legend positioning is a known collision source; prefer section headings over legend-dependent layout.
- Sticky action bars must not cover table paginators or toast messages (`z-index` + bottom offset).
- Collapsed panels must not hide required fields from validation feedback; invalid sections expand/highlight on submit.
- Pagination “0 of 0” with visible rows is a separate data/binding bug to fix while applying the list pattern on Campaigns list.

## Out of scope follow-ups

- Restoring Optimus/Spartan dual-stack work (tracked separately).
- Cross-module masters/reports UX pass.
