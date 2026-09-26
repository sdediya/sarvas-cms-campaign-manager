# Campaign Module UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a shared campaign UX pattern kit across all `src/app/cms/campaign/` screens so forms and lists are spaced consistently, fieldset collisions are gone, and long forms use collapsible sections plus sticky actions—without changing APIs or form control names.

**Architecture:** Add campaign-scoped CSS (`.cms-campaign …`) and reuse PrimeNG `p-panel` (toggleable) instead of `p-fieldset` legends for section chrome. Roll out Foundation → Wave A (list + add/edit) → Wave B → Wave C → build exit gate.

**Tech Stack:** Angular 22, PrimeNG 21 (`PanelModule`, existing SharedUiModule), PrimeFlex grid, component CSS + `src/styles.css` import.

## Global Constraints

- Keep all reactive form control names, validators, and HTTP payloads unchanged.
- Campaign-scoped styles only (`.cms-campaign` root); do not redesign non-campaign CMS modules.
- No Spartan NG migration in this pass.
- Collapsible sections: Details expanded by default; expand any invalid section on failed submit.
- Sticky actions must not cover toasts (`z-index` ≤ content, bottom padding on form).
- Verify with `npm run build:staging` after each wave.

## File map

| File | Responsibility |
|---|---|
| `src/app/cms/campaign/campaign-ux.css` | Shared pattern kit CSS |
| `src/styles.css` | `@import` campaign-ux.css |
| `src/app/shared/shared-ui.module.ts` | Export `PanelModule` |
| `list-campaign/*` | Wave A list pattern |
| `add-campaign/*` | Wave A long-form pattern + expand-on-error |
| Smart URL / landing / theme / config / black-white / service-api-doc | Waves B–C apply same classes |

---

### Task 1: Foundation — pattern CSS + PanelModule

**Files:**
- Create: `src/app/cms/campaign/campaign-ux.css`
- Modify: `src/styles.css` (add import after legacy tokens)
- Modify: `src/app/shared/shared-ui.module.ts` (import/export `PanelModule` from `primeng/panel`)

**Interfaces:**
- Produces: CSS classes `.cms-campaign`, `.cms-page`, `.cms-filter-bar`, `.cms-list-tools`, `.cms-form-section`, `.cms-control-row`, `.cms-sticky-actions`, `.cms-table-dense`

- [ ] **Step 1: Add `campaign-ux.css`** with page/filter/list-tools/form-section/control-row/sticky-actions/table-dense rules under `.cms-campaign`.
- [ ] **Step 2: Import** `./app/cms/campaign/campaign-ux.css` from `src/styles.css`.
- [ ] **Step 3: Export `PanelModule`** from `SharedUiModule`.
- [ ] **Step 4: Run** `npm run build:staging` — expect exit 0.
- [ ] **Step 5: Commit** `feat(campaign): add UX pattern kit CSS and PanelModule`

---

### Task 2: Wave A — Campaigns list

**Files:**
- Modify: `src/app/cms/campaign/list-campaign/list-campaign.component.html`
- Modify: `src/app/cms/campaign/list-campaign/list-campaign.component.ts` only if pagination binding is wrong

**Interfaces:**
- Consumes: `.cms-campaign`, `.cms-page`, `.cms-filter-bar`, `.cms-list-tools`, `.cms-table-dense`

- [ ] **Step 1:** Wrap card in `cms-campaign cms-page`; title `cms-page-title`; replace Filters divider with `.cms-filter-bar` (keep Clear).
- [ ] **Step 2:** Caption → `.cms-list-tools`; add dense table class on `p-table`.
- [ ] **Step 3:** Confirm `totalRecords` assignment in `nextPage`; fix only if broken.
- [ ] **Step 4:** `npm run build:staging` — exit 0.
- [ ] **Step 5:** Commit `feat(campaign): apply list UX pattern to Campaigns list`

---

### Task 3: Wave A — Add/Edit Campaign long-form

**Files:**
- Modify: `add-campaign.component.html`, `.ts`, optionally `.css`

**Interfaces:**
- Consumes: PanelModule + pattern CSS
- Produces: `sectionCollapsed` + `expandInvalidSections()` on invalid submit

- [ ] **Step 1:** Add `sectionCollapsed` / `sectionControls` / `expandInvalidSections()`; call from `onSubmit` when invalid.
- [ ] **Step 2:** Replace `p-fieldset` with toggleable `p-panel` (`details` open; others collapsed); keep WAP `@if`.
- [ ] **Step 3:** Apply `.cms-control-row` to radio/checkbox/toggle groups; sticky Submit/Cancel.
- [ ] **Step 4:** `npm run build:staging` — exit 0.
- [ ] **Step 5:** Commit `feat(campaign): collapsible sections and sticky actions on add/edit`

---

### Task 4: Wave B — Smart URL + Landing page config

**Files:** `list-smart-url`, `add-smart-url`, `list-landing-page-configuration`, `add-landing-page-configuration`

- [ ] **Step 1:** List pattern on both list screens.
- [ ] **Step 2:** Form sections + sticky actions on add/edit (panel or card).
- [ ] **Step 3:** `npm run build:staging` — exit 0.
- [ ] **Step 4:** Commit `feat(campaign): Wave B UX patterns for smart URL and landing config`

---

### Task 5: Wave C — Remaining campaign screens

**Files:** theme, configuration list/add, blacklist/whitelist list/add, service-api-doc

- [ ] **Step 1:** Theme + configuration forms → sections + sticky actions.
- [ ] **Step 2:** Lists → list pattern.
- [ ] **Step 3:** Service API doc → page shell only.
- [ ] **Step 4:** `npm run build:staging` — exit 0.
- [ ] **Step 5:** Commit `feat(campaign): Wave C UX patterns for remaining campaign screens`

---

### Task 6: Exit gate

- [ ] **Step 1:** Check success criteria vs spec.
- [ ] **Step 2:** Final `npm run build:staging`.
- [ ] **Step 3:** Polish commit if needed.

## Spec coverage

| Spec item | Task |
|---|---|
| Pattern kit CSS | 1 |
| No fieldset legend collision | 3–5 |
| Campaigns list | 2 |
| Add/Edit collapsible + sticky + expand invalid | 3 |
| Smart URL / landing | 4 |
| Theme / config / lists / API doc | 5 |
| build:staging | 1–6 |
