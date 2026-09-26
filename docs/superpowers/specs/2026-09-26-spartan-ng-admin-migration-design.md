# Design: Optimus/Aura → Spartan NG (full CMS pivot)

**Date:** 2026-09-26  
**Project:** vas-campaign-manager-dev (Shemaroo Campaign Manager)  
**Status:** Approved — design locked; implementation plan next  

**Related docs:**

- [CMS UI/UX Design](./2026-09-26-cms-ui-ux-design.md) — denser enterprise patterns, page shapes, shared building blocks (authoritative for visual/UX language on Spartan pages)
- [Optimus UI Migration Design](./2026-09-26-optimus-ui-migration-design.md) — prior Optimus-as-destination direction

**Supersedes:** For **future UI work**, this document **supersedes** the Optimus-as-destination direction in `2026-09-26-optimus-ui-migration-design.md`. Optimus remains in the app during the strangler and is not removed until final cutover criteria are met. The CMS UX redesign goals in `2026-09-26-cms-ui-ux-design.md` still apply; Spartan NG is the component/shell destination that delivers them.

---

## Problem

- The CMS currently runs on **Optimus UI** (PrimeNG-compatible `p-*` stack) under a Sakai-derived layout shell, with Aura/light tokens.
- Continuing to invest in Optimus-as-destination locks the product into a Prime-shaped API, mixed density, and incomplete redesign leverage.
- Goal: **full CMS pivot** from Optimus/Aura to **Spartan NG** (Tailwind + brain/hlm) — not a theme swap and not a shell-only restyle — while keeping the app shippable via a dual-stack strangler.

## Goals

1. **Full pivot:** New admin chrome and migrated features use Spartan NG + Tailwind; Optimus is transitional only.
2. **Dual-stack strangler:** Optimus and Spartan coexist safely until features are cut over one at a time.
3. **UX redesign:** Deliver the denser enterprise CMS look from the UX spec (not visual parity with Sakai/Aura). Retain Shemaroo brand identity; light default.
4. **Pattern lock-in via prototypes:** Two end-to-end Spartan pages prove filters/table/export and complex forms before broad rollout.
5. **No backend churn:** Services, APIs, auth, and permission guards stay unchanged.

## Non-goals (v1)

- Dark UI toggle in the product (dark-mode **tokens** may exist; no user-facing switch).
- Campaign Theme as a product feature rewrite (`/campaign/theme` stays Optimus until a later phase; out of prototype scope).
- Mass deletion of Lara/Saga/PrimeFlex/legacy layout assets until the Spartan shell and prototypes are stable.
- New global UI state store or new client-side data-grid state library for the prototype phase.
- Mixing Spartan and Optimus components on the **same template**.

---

## Approaches considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **1. Dual-stack strangler** — add Tailwind + `@spartan-ng`; new Spartan shell; Optimus pages in content outlet until replaced; route is Spartan **or** Optimus | Incremental; shippable; clear ownership per route | Temporary dual CSS/icon stacks; discipline required to prevent bleed | **Approved** |
| **2. Shell-only restyle** — keep Optimus pages; restyle Chrome | Fast cosmetic win | Does not escape `p-*`; redesign limited | Rejected |
| **3. Theme-only / token swap on Optimus** | Lowest code churn | Still Optimus destination; fails full pivot | Rejected |
| **4. Big-bang rewrite all ~95 routes** | Clean end state sooner on paper | High regression; freezes shipping | Rejected |

---

## Visual / UX target

Aligned with [CMS UI/UX Design](./2026-09-26-cms-ui-ux-design.md), executed on Spartan:

1. **Fuller redesign** — denser enterprise CMS; **not** Sakai/Aura visual parity.
2. **Shemaroo brand retained** — primary accent and chrome follow brand and **replace** Aura emerald (`#10b981`) as the destination accent. Phase 0 sets one primary hex (and scale) in the Spartan theme CSS from existing Shemaroo brand assets (logo/marketing); shell and Spartan primitives consume that token only.
3. **Light default** — production UI is light. CSS variables include **dark-ready** counterparts; **no dark toggle in v1**.
4. **Density & hierarchy** — page header (title left, actions right); filter bar with Apply/Clear; labeled fields above controls; noun labels; table chrome with search + Export Excel (text+icon); form sections + Submit/Cancel footer.
5. **Icons** — Lucide (or Spartan default icon set) on Spartan pages; **PrimeIcons (`.pi`) only on Optimus pages**.

Freeze the two prototypes as the visual acceptance bar before rolling out other features.

---

## Prototype targets (pattern lock-in)

Phase 0 rebuilds these **existing** routes on Spartan end-to-end (same URLs, new templates/components under the Spartan stack). Behavior and APIs stay the same.

| # | Pattern | Route | Component (today) | Why this one |
|---|--------|-------|-------------------|--------------|
| 1 | Heavy reports (filters + large table + export) | `/reports/revenue-report-v2` | `RevenueReportV2Component` | Primary menu entry for revenue reporting; already the UX-spec Tier D reference; real filter cascade (telcom → aggregator → product → service), scrollable table, Excel export via existing `ExcelExportService` |
| 2 | Complex campaign create/edit form | `/campaign/add` and `/campaign/edit` | `AddCampaignComponent` (shared) | UX-spec Tier A reference; densest form in the CMS; create and edit share one component so one Spartan rewrite covers both paths |

**Explicitly not prototype #1 alternatives:** older `/reports/revenue-report`, live dashboard, or ageing dumps — they are either superseded in the menu, chart-heavy, or less representative of the filter+table+export runner shape.

**Explicitly not prototype #2 alternatives:** Campaign Theme, Configuration, Smart URL — simpler or different shapes; Theme is also out of scope for v1 product work.

---

## Architecture

### High-level

```
Angular 22 app
  ├── Spartan admin shell (sidebar + topbar + content)
  │     ├── Spartan routes → Spartan feature templates (brain/hlm + Tailwind)
  │     └── Optimus routes → existing p-* pages rendered in content outlet
  ├── SharedUiModule          (Optimus barrel — keep during strangler)
  ├── SharedSpartanModule     (or standalone imports for Spartan routes)
  ├── Theme: CSS vars (light + dark-ready), Shemaroo primary
  └── Services / AuthGuard / permissions / APIs — unchanged
```

### Dual-stack rules (hard)

1. **One stack per template:** A route’s component tree is either Spartan **or** Optimus — never both on the same template.
2. **Shell owns chrome:** Sidebar (`menu.json` + existing permission filtering), topbar, and content outlet are Spartan’s. Optimus pages are content only.
3. **Keep Optimus on existing unmigrated routes:** No premature rewrite of unrelated features.
4. **Styling isolation:** Tailwind/Spartan styles must not break Optimus pages; Optimus/PrimeFlex must not pollute Spartan pages. Dual-stack CSS bleed is a **review failure**.
5. **Migrated = clean:** A feature is “migrated” only when its templates/modules have **no** `p-*` / Optimus imports for that feature.

### Theme layer

- Introduce a Spartan/Tailwind theme layer with CSS custom properties for light mode.
- Include dark-ready token counterparts for future use; do not wire a UI toggle in v1.
- Brand primary follows Shemaroo (set once in foundation; used by shell + Spartan primitives).

### Shell

- Replace Sakai layout chrome with a Spartan shell: **sidebar**, **topbar**, **content**.
- Menu source remains `src/assets/menu.json` with the same permission/`item_key` behavior as today.
- Auth routes (`/auth/*`) stay outside the authenticated shell unless explicitly migrated later; v1 focus is authenticated CMS chrome + prototypes.

### Shared modules / wrappers

| Piece | Role |
|-------|------|
| `SharedUiModule` | Existing Optimus imports barrel — **unchanged ownership** for Optimus pages during strangler |
| `SharedSpartanModule` (or standalone) | Spartan brain/hlm + Lucide (or Spartan default) for Spartan routes |
| Thin CMS wrappers | `CmsPageHeader`, `CmsFilterBar`, `CmsDataTable`, `CmsFormSection`, `CmsEmptyState` — shared language for Spartan pages; map to UX-spec PageHeader / FilterBar / DataTableChrome / FormSection / empty states |

Wrappers stay thin (layout + slots + consistent copy/spacing). They do not own API calls or domain state.

### Data flow

- Same route tree under the new shell (CMS child routes continue under the authenticated layout).
- Feature services, HTTP APIs, auth, and guards are **unchanged**.
- **No** new global UI store.
- **No** new data-grid state library for prototypes (local component state + existing services).
- Export continues through existing Excel export path; success/failure via toast.

---

## Phasing

### Phase 0 — Foundation + two prototypes

1. Add Tailwind + `@spartan-ng` (brain/hlm) alongside Optimus.
2. Theme CSS vars (light + dark-ready) and Shemaroo primary.
3. Spartan admin shell; mount existing Optimus pages in the content outlet.
4. Implement CMS wrappers listed above.
5. Rebuild prototypes end-to-end on Spartan:
   - `/reports/revenue-report-v2`
   - `/campaign/add` + `/campaign/edit`
6. Manual QA lock-in (see Testing). Smoke remaining Optimus routes after shell swap.

**Exit criteria for Phase 0:** Both prototypes meet UX checklist; no stack mixing on those templates; Optimus routes still usable under the new shell; staging build green.

### Rollout (after Phase 0)

- Migrate feature-by-feature using shared CMS primitives.
- Prefer the tier order from the UX spec (lists → reports → complex forms → simple forms → auth polish), adjusted only when a dependency forces otherwise.
- Remove Optimus **per feature** when that feature is migrated (not a single mass delete mid-rollout).
- Lara/Saga/legacy layout asset cleanup only after shell + prototypes are stable and a meaningful set of features have cut over.

### Final Optimus removal criteria

Optimus/SharedUiModule/`p-*`/PrimeIcons may be removed from the app only when **all** of the following hold:

1. No authenticated CMS feature route still depends on Optimus components.
2. `rg` finds no `@openng/optimus-ui`, `p-*` template usage, or `.pi` icon classes under migrated `src/app/cms` feature trees (auth/login may lag as a deliberate last item).
3. Staging + prod builds pass; smoke checklist covers Login, Campaign List, Add/Edit Campaign, Revenue Report v2, one logs page, one masters list.
4. Rollback branch or prior release tag remains available for cutover incidents.

---

## Error & feedback handling

| Case | Behavior |
|------|----------|
| Loading | Explicit loading state on Spartan pages (spinner/skeleton in content — no blank silent wait) |
| Empty | Explicit empty state via `CmsEmptyState` (not a bare empty table) |
| Error (data fetch) | Explicit error messaging; user can retry or navigate away |
| Form submit fail | Keep form values; show validation/API errors; do not wipe the form |
| Export | Toast on success/failure (existing MessageService or Spartan toast equivalent wired to the same UX) |
| Auth / permissions | Existing `AuthGuard` and menu permission filtering **unchanged** |
| Dual-stack bleed | CSS or component mixing across stacks = **PR review failure** |

---

## Testing & quality gates

1. **Prototype QA lock-in (manual):** For Revenue Report v2 and Add/Edit Campaign — filters, submit/load, table/pagination or scroll, export, validation, cancel/back, empty/error/loading paths, permission-denied paths as applicable.
2. **Shell smoke:** After shell swap, spot-check representative Optimus routes (Campaign List, Callback Logs, one masters list, Login) for layout/content regression.
3. **Unit tests:** Pragmatic only — non-trivial CMS wrappers (e.g. FilterBar Apply/Clear behavior). Do not require full component suite for every prototype template.
4. **Rollout gate checklist (per migrated feature):**
   - No Optimus/`p-*` in that feature’s templates/modules
   - Uses CMS wrappers where applicable
   - Loading / empty / error covered
   - Smoke against permissions
   - Staging build green
5. **Final removal:** Criteria in Architecture / Final Optimus removal above.

---

## Success criteria

- [ ] Tailwind + Spartan brain/hlm present; Optimus still available for unmigrated routes
- [ ] Spartan shell hosts sidebar + topbar + content; menu still driven by `menu.json` + permissions
- [ ] `/reports/revenue-report-v2` and `/campaign/add`|`/edit` are Spartan-only templates meeting denser enterprise UX checklist
- [ ] CMS wrappers exist and are used by prototypes
- [ ] Light UI default; dark tokens ready; no dark toggle
- [ ] No dual-stack bleed on migrated pages; review rejects mixed templates
- [ ] Services/API/auth/guards unchanged
- [ ] Rollout rules and final Optimus removal criteria documented and followed

---

## Risks (called out)

1. **CSS bleed between Tailwind and Optimus/PrimeFlex** — highest strangler risk; mitigate with scoped layout, careful global CSS, and review checklist.
2. **Shell swap regressions on Optimus pages** — content outlet/padding/overflow differences; require smoke before calling Phase 0 done.
3. **Wrapper drift** — if features bypass `Cms*` wrappers, redesign consistency collapses; rollout gate requires wrapper use where the pattern applies.
4. **Icon/stack confusion** — `.pi` leaking onto Spartan pages (or Lucide onto Optimus) is a review failure.
5. **Scope creep into Theme / dark mode / mass asset delete** — explicitly deferred; do not expand Phase 0.

---

## Approval

This design is **approved**. Proceed to an implementation plan covering Phase 0 (foundation + two prototypes) and the rollout rules above. Do not treat Optimus-as-destination docs as the future UI target.
