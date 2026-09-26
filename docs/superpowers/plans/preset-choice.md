# Optimus theme preset choice (Task 4 Step 4)

## Decision

**Keep Aura** (`@openng/optimus-ui-themes/aura`).

## Comparison performed

| Check | Aura | Lara |
| --- | --- | --- |
| `npm run build:staging` | PASS (baseline Task 4) | PASS (hash `dae57c1b519a8123`, ~79s) |
| Side-by-side visual QA | N/A (current production baseline) | Not run in this pass |

## Rationale

1. **Frozen layout tokens** — `src/assets/layout/styles/theme/legacy-layout-tokens.css` documents the Task 2 light baseline as “Aura emerald primary” with `--primary-color: #10b981`, aligned with Optimus Aura’s emerald.500 primary. Lara uses a different primary palette; switching would desync layout chrome from component theme tokens unless tokens are re-frozen and re-QA’d.

2. **No visual regression signal for Lara** — Lara compiles cleanly, but without a dedicated visual pass we cannot justify a preset change that affects every Optimus surface.

3. **Configuration unchanged** — `provideOptimus` remains Aura with `darkModeSelector: 'none'` so CMS stays on light UI regardless of OS dark mode.

## Trial diff (reverted)

Lara trial in `src/app/app.module.ts` was reverted after the staging build; runtime preset is Aura.

## Revisit

Consider Lara (or a custom preset) after Task 5+ UX QA if designers want a non-emerald look; update `legacy-layout-tokens.css` in the same change.
