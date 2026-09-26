# Design: PrimeNG 22 → Optimus UI (UI-safe)

**Date:** 2026-09-26  
**Project:** vas-campaign-manager-dev  
**Status:** Pending approval before implementation  

## Problem

- PrimeNG 22 introduced commercial licensing and API drift from the Lara-era CMS.
- UI already shows breakage (dark mode, blank buttons, NaN paginator, misaligned forms) during the 15→22 upgrade.
- Goal: move to **Optimus UI** (MIT, PrimeNG-v21-compatible fork) **without visual regression**, and leave the CMS looking intentional to a UI/UX designer—not “half-migrated.”

## Goals

1. **No broken screens** during/after cutover (build green + smoke QA gate per module).
2. **MIT / no license banner.**
3. **Designer-quality light CMS:** consistent density, hierarchy, alignment, feedback colors.
4. **Keep Sakai layout shell** (topbar, menu, content area)—only swap the component library under it.

## Non-goals

- Full visual rebrand / new design system from scratch.
- Migrating away from `p-*` selectors (Optimus keeps them).
- Rewriting business logic or routes.

## Approaches considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **A. Stabilize UX tokens → Optimus schematic (`--force`) → API reconcile → visual QA** | Keeps Angular 22; schematic does package rename; UI freeze first reduces risk | Must reconcile PrimeNG-22-only APIs with Optimus-v1 (≈PrimeNG 21) | **Recommended** |
| **B. Downgrade to PrimeNG 21 then schematic (official path)** | Official Optimus prerequisite | Peer conflicts with Angular 22; temporary double churn | Fallback if A fails |
| **C. Switch to Angular Material / NG-ZORRO** | Clean vendor story | Full template rewrite; high UI break risk | Rejected |

## Visual / UX target (designer bar)

Treat the post-migration UI as a **light enterprise CMS**, not “default Aura dark/system.”

1. **Light only** — `darkModeSelector: 'none'` (or Optimus equivalent).
2. **Surfaces** — page ground `#eff3f8`, cards white, 1px `#dfe7ef` borders, soft card shadow.
3. **Typography** — system UI stack; titles `h5` consistent weight; labels above fields; required `*` in red.
4. **Density** — form fields in 12-col `formgrid`; filters max ~3–4 controls per row; controls not full-bleed unless intentional.
5. **Buttons** — primary = Submit/Add; danger = Cancel/Delete; icon-only actions use clear glyphs (trash/plus/pencil/excel), never empty colored blocks.
6. **Tables** — header weight 600, row divider, hover wash; paginator never shows `NaN` (`totalRecords` always a number).
7. **Feedback** — validation `.p-error` red; toasts via existing MessageService path; no license host badge.
8. **Search** — icon inset with padded input (`p-iconfield` / compatible pattern).

Freeze this as the acceptance checklist before calling migration “done.”

## Architecture

```
Angular 22 app
  └── provideOptimus({ theme: { preset: Aura|Lara, options: { darkModeSelector: 'none' } } })
  └── SharedUiModule  (imports from @openng/optimus-ui/*)
  └── Sakai layout CSS + legacy-layout-tokens.css (keep)
  └── Feature modules unchanged structurally
```

Package map: `primeng` → `@openng/optimus-ui`, `@primeuix/themes` → `@openng/optimus-ui-themes`, `primeicons` → `@openng/icons`.

## Risk: API surface

Current code already uses some **PrimeNG 22** patterns (`severity`, `iconOnly`, `tableStyleClass`, `p-iconfield`). Optimus UI v1 mirrors **PrimeNG 21**. Migration must include an **API compatibility pass** (map or polyfill) so the UI does not regress to empty buttons / naked tables.

## Success criteria

- [ ] `rg` finds no `primeng|primeicons|@primeuix|providePrimeNG` in `src/`
- [ ] Staging + prod builds pass
- [ ] No “Invalid PrimeUI License” banner
- [ ] UX checklist passes on: Login, Add Campaign, Campaign List, Blacklist List, Callback Logs, one report page
- [ ] Rollback branch available if cutover fails

## Approval

Approve this design to proceed with the implementation plan at  
`docs/superpowers/plans/2026-09-26-optimus-ui-migration.md`.
