# Optimus UI Migration (UI-safe) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace PrimeNG 22 with Optimus UI (MIT) while keeping (and polishing) the existing light CMS look so screens stay usable and designer-acceptable.

**Architecture:** Freeze a Sakai + token-based light theme first; cut over packages via Optimus `migrate-from-primeng` schematic (with `--force` because the app is on PrimeNG 22); reconcile any v22-only APIs to Optimus v1 (≈PrimeNG 21) compatibility; run module-by-module visual QA against a fixed UX checklist; keep a rollback branch.

**Tech Stack:** Angular 22.2, Optimus UI `@openng/optimus-ui@1`, `@openng/optimus-ui-themes@1`, `@openng/icons`, existing Sakai layout (`src/assets/css/styles.css`, `legacy-layout-tokens.css`), `SharedUiModule`.

**Design reference:** `docs/superpowers/specs/2026-09-26-optimus-ui-migration-design.md`

## Global Constraints

- Do **not** redesign routes, business APIs, or copy unless required for compile.
- Keep **light theme only** (`darkModeSelector: 'none'` or Optimus equivalent).
- Keep `p-*` / `pi-*` prefixes (Optimus preserves them).
- Every task must leave `npm run build:staging` green before the next task starts.
- No empty icon buttons; no `0 of NaN` paginators; no license banner.
- Prefer Lara or Aura **light** preset—choose whichever matches current screens closest after a side-by-side check in Task 4.
- Pin Optimus packages to **`@1`** during cutover (per Optimus docs).

## File map

| File / area | Responsibility |
|-------------|----------------|
| `package.json` / lockfile | Swap primeng family → Optimus packages |
| `src/app/app.module.ts` | `provideOptimus` + theme options + remove license key |
| `src/app/shared/shared-ui.module.ts` | All UI kit imports from `@openng/optimus-ui/*` |
| `src/styles.css` | Icons CSS path + Aura/Optimus compatibility layer |
| `src/assets/layout/styles/theme/legacy-layout-tokens.css` | Designer light tokens (ground, text, borders) |
| `src/index.html` | Layout CSS links only (no PrimeNG theme.css) |
| Feature `*.html` / `*.ts` under `src/app/cms/**` | Only if schematic leftovers or API reconcile needs |
| `docs/superpowers/plans/ux-qa-checklist.md` | Visual acceptance checklist (created in Task 1) |

---

### Task 1: Branch, baseline, UX checklist freeze

**Files:**
- Create: `docs/superpowers/plans/ux-qa-checklist.md`
- Modify: none (git branch only)

**Interfaces:**
- Produces: named git branch `chore/optimus-ui-migration`; baseline build artifact; written UX gate used by later tasks

- [ ] **Step 1: Create rollback-friendly branch**

```bash
git checkout -b chore/optimus-ui-migration
git status
```

Expected: clean or only intentional WIP; on new branch.

- [ ] **Step 2: Record baseline versions**

```bash
node -e "console.log(require('./node_modules/@angular/core/package.json').version); console.log(require('./node_modules/primeng/package.json').version)"
npm run build:staging
```

Expected: Angular `22.x`, PrimeNG `22.x`, staging build **PASS**. Note any existing compile warnings in the PR description later.

- [ ] **Step 3: Write UX QA checklist file**

Create `docs/superpowers/plans/ux-qa-checklist.md` with exactly:

```markdown
# UX QA Checklist (Optimus migration)

Pass/fail per screen. Fail = do not merge.

## Global
- [ ] Light background (not black / not OS-dark)
- [ ] No "Invalid PrimeUI License" badge
- [ ] Body text readable dark-on-light
- [ ] Primary actions green/teal; danger red; no empty colored blocks
- [ ] Form labels above inputs; required * in red
- [ ] Filter rows: controls sized, not stretched edge-to-edge without need
- [ ] Tables: header distinct; row separators; hover wash
- [ ] Paginator never shows NaN (use `0 of 0` when empty)
- [ ] Search icon does not overlap placeholder text
- [ ] Toast/dialog readable on light surface

## Screens (minimum)
- [ ] Login — Sign In label visible; card centered
- [ ] Add Campaign — fieldsets aligned; Options trash/plus icons; Cancel danger with label
- [ ] Campaign List — search + export; edit icons
- [ ] Blacklist Configuration List — filters, search, paginator, delete icon
- [ ] Callback Logs — date/telcom/partner row + Submit
- [ ] One report page (e.g. Revenue or Live Dashboard) — Submit + Excel export icon
```

- [ ] **Step 4: Commit checklist + branch start**

```bash
git add docs/superpowers/plans/ux-qa-checklist.md docs/superpowers/specs/2026-09-26-optimus-ui-migration-design.md docs/superpowers/plans/2026-09-26-optimus-ui-migration.md
git commit -m "$(cat <<'EOF'
docs: add Optimus UI migration plan and UX QA checklist

EOF
)"
```

---

### Task 2: Freeze designer light theme on current PrimeNG (no Optimus yet)

**Files:**
- Modify: `src/assets/layout/styles/theme/legacy-layout-tokens.css`
- Modify: `src/styles.css`
- Modify: `src/app/app.module.ts` (confirm `darkModeSelector: 'none'`)

**Interfaces:**
- Consumes: existing Aura setup
- Produces: stable light visual baseline so Optimus cutover is judged against a known-good look

- [ ] **Step 1: Ensure layout tokens define the designer palette**

Confirm `:root` in `legacy-layout-tokens.css` includes at least:

```css
--surface-ground: #eff3f8;
--surface-card: #ffffff;
--surface-border: #dfe7ef;
--text-color: #495057;
--text-color-secondary: #6c757d;
--primary-color: #6366f1; /* or keep Aura green primary if screens already use it — pick one and stick to it */
color-scheme: light;
```

And `html, body { background-color: var(--surface-ground); color: var(--text-color); }`.

- [ ] **Step 2: Confirm app.module theme lock**

In `src/app/app.module.ts`, theme options must include:

```typescript
options: {
  darkModeSelector: 'none',
},
```

- [ ] **Step 3: Smoke visual baseline**

```bash
npm run start:hrm
```

Manually open Login + Add Campaign + Blacklist. Expected: light UI, no black page. Mark Global items in checklist that already pass.

- [ ] **Step 4: Commit**

```bash
git add src/assets/layout/styles/theme/legacy-layout-tokens.css src/styles.css src/app/app.module.ts
git commit -m "$(cat <<'EOF'
fix: freeze light CMS theme tokens before Optimus cutover

EOF
)"
```

---

### Task 3: Install Optimus and run migration schematic

**Files:**
- Modify: `package.json`, lockfile
- Modify: all `src/**/*.ts` imports rewritten by schematic
- Modify: `src/styles.css` / `angular.json` icon CSS path (schematic)

**Interfaces:**
- Produces: codebase compiling against `@openng/optimus-ui` (may need Task 4 for API gaps)

- [ ] **Step 1: Install Optimus v1 (pinned)**

```bash
npm install @openng/optimus-ui@1 @openng/optimus-ui-themes@1 @openng/icons
```

Expected: packages present; peer warnings about Angular 22 are OK if install succeeds.

- [ ] **Step 2: Run official schematic with force (app is on PrimeNG 22)**

```bash
npx ng generate @openng/optimus-ui@1:migrate-from-primeng --force
```

Expected: package.json swaps primeng → optimus; imports rewritten; leftover report printed. **Scroll up and save the leftover report** into `docs/superpowers/plans/optimus-leftovers.md`.

- [ ] **Step 3: Remove PrimeNG license key**

In `src/app/app.module.ts` (or wherever provider lives), ensure config looks like:

```typescript
import { provideOptimus } from '@openng/optimus-ui/config';
import Aura from '@openng/optimus-ui-themes/aura';
// or Lara from '@openng/optimus-ui-themes/lara' after Task 4 comparison

provideOptimus({
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: 'none',
    },
  },
  // NO license property
}),
```

- [ ] **Step 4: Point icons CSS at OpenNG icons**

In `src/styles.css`:

```css
@import "@openng/icons/openng-icons.css";
/* remove: @import "primeicons/primeicons.css"; */
```

Verify `pi pi-*` classes still resolve (OpenNG keeps `pi-` prefix).

- [ ] **Step 5: Grep leftovers**

```bash
rg -n "primeng|primeicons|@primeuix|providePrimeNG" src package.json angular.json || true
```

Expected: empty for runtime sources. Fix any hits manually using Optimus rename table:

| From | To |
|------|----|
| `primeng/...` | `@openng/optimus-ui/...` |
| `@primeuix/themes/...` | `@openng/optimus-ui-themes/...` |
| `providePrimeNG` | `provideOptimus` |
| `primeicons/primeicons.css` | `@openng/icons/openng-icons.css` |

- [ ] **Step 6: Build**

```bash
npm run build:staging
```

If FAIL → do **not** commit; continue to Task 4 with the error list. If PASS → commit:

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: migrate PrimeNG packages to Optimus UI v1

EOF
)"
```

---

### Task 4: API compatibility pass (PrimeNG 22 → Optimus ≈ v21)

**Files:**
- Modify: `src/app/shared/shared-ui.module.ts`
- Modify: feature templates that fail compile or render empty controls
- Optionally Create: `src/app/shared/optimus-compat.md` (notes only)

**Interfaces:**
- Consumes: Optimus modules
- Produces: green build + non-empty icon buttons / working tables

**Known high-risk patterns already used in this repo:**

| Pattern | If Optimus rejects / mis-renders | Compatible fallback |
|---------|----------------------------------|---------------------|
| `<p-button severity="danger" icon="pi pi-trash" [iconOnly]="true">` | Use `styleClass` + child icon, or `pButton` native button with inner `<i>` | Keep visual trash/danger |
| `tableStyleClass=` on `p-table` | Use `styleClass=` if that is the Optimus/v21 name | Same striping classes |
| `<p-iconfield>` / `<p-inputicon>` | Revert to `<span class="p-input-icon-left">` **plus** CSS padding in `styles.css` | No icon/placeholder overlap |
| `size="small"` on Button | Use `styleClass="p-button-sm"` | Same density |
| `provideOptimus` theme options | Match Optimus docs for darkModeSelector | Light-only |

- [ ] **Step 1: Collect compile errors**

```bash
npm run build:staging 2>&1 | tee /tmp/optimus-build.log
rg -n "error NG|error TS" /tmp/optimus-build.log | head -80
```

- [ ] **Step 2: Fix SharedUiModule import paths**

`src/app/shared/shared-ui.module.ts` must import from `@openng/optimus-ui/...` only, e.g.:

```typescript
import { TableModule } from '@openng/optimus-ui/table';
import { ButtonModule } from '@openng/optimus-ui/button';
import { SelectModule } from '@openng/optimus-ui/select';
// ... every former primeng/* import
```

If a module name moved/removed in Optimus, replace with the documented Optimus equivalent—do not leave a primeng import.

- [ ] **Step 3: Fix template API mismatches module-by-module**

Order (highest UI risk first):

1. `src/app/cms/auth/**`
2. `src/app/cms/campaign/**` (Add Campaign, Blacklist, List)
3. `src/app/cms/logs/**`
4. `src/app/cms/masters/**`
5. `src/app/cms/reports/**`
6. Remaining CMS modules

For each compile error: apply the fallback table above; rebuild until that module’s errors are gone.

- [ ] **Step 4: Side-by-side preset choice (Aura vs Lara)**

Temporarily try Lara:

```typescript
import Lara from '@openng/optimus-ui-themes/lara';
provideOptimus({ theme: { preset: Lara, options: { darkModeSelector: 'none' } } });
```

Compare Login + Add Campaign to Aura. **Keep the preset that matches the previous light CMS closer** (forms denser / indigo primary → often Lara; green Aura primary → Aura). Commit the chosen preset only.

- [ ] **Step 5: Build + commit**

```bash
npm run build:staging
git add -A
git commit -m "$(cat <<'EOF'
fix: reconcile Optimus APIs for Angular 22 CMS templates

EOF
)"
```

---

### Task 5: UX polish pass (designer bar)

**Files:**
- Modify: `src/styles.css` (global density / table / iconfield / button host)
- Modify: hotspot templates if layout still broken:
  - `src/app/cms/campaign/add-campaign/add-campaign.component.html`
  - `src/app/cms/campaign/blacklist/list-blacklist/list-blacklist.component.html`
  - `src/app/cms/logs/callback-logs/callback-logs.component.html`
  - `src/app/cms/auth/login/login.component.html`

**Interfaces:**
- Produces: checklist Global section all checked

- [ ] **Step 1: Enforce formgrid + field spacing**

Ensure `src/styles.css` contains (adjust only if missing after migration):

```css
.formgrid.grid > .col,
.formgrid.grid > [class*="col"],
.p-formgrid.grid > .col,
.p-formgrid.grid > [class*="col"] {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.p-input-icon-left > input,
.p-iconfield > input {
  padding-left: 2.5rem !important;
}

.p-error { color: #e24c4c; }
```

- [ ] **Step 2: Button hierarchy polish**

Rules to enforce in templates when touching a file:

- Submit / Add / primary → default or `severity="success"` / raised primary—one convention app-wide
- Cancel / Delete → `severity="danger"` **with visible label or icon**
- Never leave `<p-button></p-button>` empty

- [ ] **Step 3: Paginator safety**

Confirm list components use:

```typescript
totalRecords: number = 0;
```

Not `any` uninitialized. Spot-check Blacklist + Campaign List + Callback Logs.

- [ ] **Step 4: Visual QA against checklist**

Run app, complete `docs/superpowers/plans/ux-qa-checklist.md` for all listed screens. Fix any fail before proceeding.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
fix: polish CMS density and controls after Optimus cutover

EOF
)"
```

---

### Task 6: Verification, cleanup, handoff

**Files:**
- Modify: `package.json` (ensure primeng deps removed)
- Update: `docs/superpowers/plans/ux-qa-checklist.md` (all boxes checked)

**Interfaces:**
- Produces: merge-ready branch

- [ ] **Step 1: Dependency cleanup**

```bash
npm uninstall primeng primeicons @primeuix/themes 2>/dev/null || true
rg -n "primeng|primeicons|@primeuix" package.json src || echo "clean"
```

Expected: `clean`.

- [ ] **Step 2: Staging + prod builds**

```bash
npm run build:staging
npm run build:prod
```

Expected: both PASS.

- [ ] **Step 3: Final UX sign-off**

Re-run checklist screens once on production build (`npx http-server` or `ng serve` against prod config if available). All boxes checked.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: complete Optimus UI migration and UX verification

EOF
)"
```

- [ ] **Step 5: Handoff note**

Document in PR:

- Optimus `@1` + chosen theme preset
- Rollback: `git checkout <previous-branch>` / revert merge
- Leftover report path if any manual items remain

---

## Rollback plan

1. Do not merge until Task 6 builds + checklist pass.
2. If cutover fails mid-way: `git reset --hard` to Task 2 commit (PrimeNG + frozen light theme still works with existing license key if needed).
3. Emergency stay-on-PrimeNG: keep branch abandoned; main remains PrimeNG 22.

## Self-review

- Spec coverage: MIT cutover, no UI break, designer bar, rollback → Tasks 1–6.
- No placeholders left in steps.
- Preset choice deferred to Task 4 with explicit decision rule (not TBD).
