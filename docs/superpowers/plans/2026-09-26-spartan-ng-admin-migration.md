# Spartan NG Admin Migration (Phase 0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up Tailwind + Spartan NG alongside Optimus, replace the Sakai shell with a Spartan admin chrome, ship CMS wrappers, and lock patterns on `/reports/revenue-report-v2` and `/campaign/add`|`/edit`.

**Architecture:** Dual-stack strangler — Optimus stays for unmigrated routes; Spartan owns shell + two prototype pages. One stack per template. Services/auth/guards unchanged.

**Tech Stack:** Angular 22.2, Tailwind CSS v4, `@spartan-ng/cli` + `@spartan-ng/brain` + helm copies, `@angular/cdk`, `@ng-icons/core` + Lucide, existing Optimus (`@openng/optimus-ui`) during strangler.

**Design reference:** `docs/superpowers/specs/2026-09-26-spartan-ng-admin-migration-design.md`  
**UX reference:** `docs/superpowers/specs/2026-09-26-cms-ui-ux-design.md`

## Global Constraints

- One stack per template: never mix `p-*` / Optimus and hlm/Spartan on the same template.
- Do **not** change HTTP APIs, `AuthGuard`, permission keys, or `menu.json` IA.
- Light UI only in product; include dark-ready CSS variables; **no** dark toggle.
- Shemaroo primary accent: `#D51F53` (logo magenta) — replace Aura emerald `#10b981` on Spartan surfaces.
- Every task must leave `npm run build:staging` green before the next task starts.
- Lucide/`ng-icon` on Spartan pages only; `.pi` only on Optimus pages.
- CSS bleed between Tailwind preflight and Optimus/PrimeFlex is a **review failure** — smoke Optimus routes after shell/Tailwind land.
- Phase 0 scope only: foundation, shell, wrappers, two prototypes. No mass Optimus removal. No `/campaign/theme` rewrite.

## File map

| File / area | Responsibility |
|-------------|----------------|
| `package.json` / lockfile | Add Tailwind v4, `@spartan-ng/cli`, `@spartan-ng/brain`, `@angular/cdk`, clsx, class-variance-authority, tailwind-merge, `@ng-icons/*` |
| `components.json` | Spartan CLI config (created by init / first ui add) |
| `src/styles.css` | Tailwind layers + spartan preset + theme vars + keep Optimus compatibility rules |
| `src/styles/spartan-theme.css` | Shemaroo light + dark-ready CSS variables |
| `src/index.html` | Unchanged legacy CSS links for Optimus pages during strangler |
| `src/app/shared/shared-spartan.module.ts` | Barrel for Spartan/helm imports used by Spartan routes |
| `src/app/shared/cms-ui/**` | `CmsPageHeader`, `CmsFilterBar`, `CmsDataTable`, `CmsFormSection`, `CmsEmptyState` |
| `src/app/cms/layout/**` | Spartan shell (topbar, sidebar, menu, layout, footer) |
| `src/app/cms/reports/revenue-report-v2/**` | Prototype A — Spartan-only templates |
| `src/app/cms/campaign/add-campaign/**` | Prototype B — Spartan-only templates |
| `docs/superpowers/plans/spartan-phase0-qa-checklist.md` | Manual QA gate for Phase 0 exit |

---

### Task 1: Tailwind v4 + Spartan init + theme tokens

**Files:**
- Modify: `package.json`, `package-lock.json`, `src/styles.css`
- Create: `src/styles/spartan-theme.css`, `components.json` (via CLI)
- Create: `docs/superpowers/plans/spartan-phase0-qa-checklist.md`

**Interfaces:**
- Consumes: none
- Produces: Tailwind + Spartan preset loadable from `src/styles.css`; CSS vars `--primary` = Shemaroo `#D51F53`; Optimus still boots

- [ ] **Step 1: Install Tailwind v4 and Angular builder wiring**

```bash
npm install -D tailwindcss@^4 postcss autoprefixer
npm install @angular/cdk clsx class-variance-authority tailwind-merge
```

If the project has no PostCSS config yet, create `postcss.config.json`:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

Also install the PostCSS plugin:

```bash
npm install -D @tailwindcss/postcss
```

- [ ] **Step 2: Install Spartan CLI and init**

```bash
npm install -D @spartan-ng/cli
npx ng g @spartan-ng/cli:init --defaults
```

If the schematic prompts, choose: styles entry `src/styles.css`, theme closest to zinc/neutral, radius `0.5rem`. Then override primary in the next step.

- [ ] **Step 3: Add required helm primitives for Phase 0**

```bash
npx ng g @spartan-ng/cli:ui --name=button
npx ng g @spartan-ng/cli:ui --name=input
npx ng g @spartan-ng/cli:ui --name=label
npx ng g @spartan-ng/cli:ui --name=select
npx ng g @spartan-ng/cli:ui --name=separator
npx ng g @spartan-ng/cli:ui --name=table
npx ng g @spartan-ng/cli:ui --name=card
npx ng g @spartan-ng/cli:ui --name=scroll-area
npx ng g @spartan-ng/cli:ui --name=dropdown-menu
npx ng g @spartan-ng/cli:ui --name=sheet
npx ng g @spartan-ng/cli:ui --name=sonner
npx ng g @spartan-ng/cli:ui --name=switch
npx ng g @spartan-ng/cli:ui --name=checkbox
npx ng g @spartan-ng/cli:ui --name=textarea
npx ng g @spartan-ng/cli:ui --name=calendar
npx ng g @spartan-ng/cli:ui --name=popover
npx ng g @spartan-ng/cli:ui --name=badge
npx ng g @spartan-ng/cli:ui --name=spinner
npx ng g @spartan-ng/cli:ui --name=icon
```

If a name fails (CLI rename), use the closest available from `ng g @spartan-ng/cli:ui` interactive list and record the actual path under `libs/ui` or `src/app/spartan-ui` (wherever the schematic copies helm).

Install Lucide icons used by Spartan:

```bash
npm install @ng-icons/core @ng-icons/lucide
```

- [ ] **Step 4: Write Shemaroo theme CSS**

Create `src/styles/spartan-theme.css`:

```css
:root {
  color-scheme: light;
  --radius: 0.5rem;
  /* Shemaroo brand primary (logo magenta) — replaces Aura emerald on Spartan surfaces */
  --primary: #d51f53;
  --primary-foreground: #ffffff;
  --background: #eff3f8;
  --foreground: #212121;
  --card: #ffffff;
  --card-foreground: #212121;
  --popover: #ffffff;
  --popover-foreground: #212121;
  --secondary: #f5f5f5;
  --secondary-foreground: #212121;
  --muted: #f5f5f5;
  --muted-foreground: #6c757d;
  --accent: #f6f9fc;
  --accent-foreground: #212121;
  --destructive: #e24c4c;
  --border: #dfe7ef;
  --input: #dfe7ef;
  --ring: #d51f53;
  --sidebar: #ffffff;
  --sidebar-foreground: #212121;
  --sidebar-primary: #d51f53;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #f6f9fc;
  --sidebar-accent-foreground: #212121;
  --sidebar-border: #dfe7ef;
  --sidebar-ring: #d51f53;
}

/* Dark-ready tokens — not activated in v1 (no .dark class toggle) */
.dark {
  color-scheme: dark;
  --background: #0f1419;
  --foreground: #f5f5f5;
  --card: #1a1f26;
  --card-foreground: #f5f5f5;
  --popover: #1a1f26;
  --popover-foreground: #f5f5f5;
  --primary: #ed1651;
  --primary-foreground: #ffffff;
  --secondary: #262b33;
  --secondary-foreground: #f5f5f5;
  --muted: #262b33;
  --muted-foreground: #9e9e9e;
  --accent: #262b33;
  --accent-foreground: #f5f5f5;
  --destructive: #ef4444;
  --border: #2e3440;
  --input: #2e3440;
  --ring: #ed1651;
  --sidebar: #1a1f26;
  --sidebar-foreground: #f5f5f5;
  --sidebar-primary: #ed1651;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #262b33;
  --sidebar-accent-foreground: #f5f5f5;
  --sidebar-border: #2e3440;
  --sidebar-ring: #ed1651;
}
```

- [ ] **Step 5: Wire styles.css**

At the **top** of `src/styles.css`, add (keep existing Optimus/icons/legacy imports **after** Tailwind layers so Optimus rules can still win where needed):

```css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";
@import "@spartan-ng/brain/hlm-tailwind-preset.css";
@import "./styles/spartan-theme.css";

@import "@openng/icons/openng-icons.css";
@import "./assets/layout/styles/theme/legacy-layout-tokens.css";
```

Ensure Spartan CLI-added theme blocks do not reintroduce emerald/`oklch` primary that overrides `#d51f53`. If the CLI wrote a large `:root` block into `styles.css`, delete its `--primary*` entries and rely on `spartan-theme.css`.

- [ ] **Step 6: Write Phase 0 QA checklist**

Create `docs/superpowers/plans/spartan-phase0-qa-checklist.md`:

```markdown
# Spartan Phase 0 QA Checklist

Fail = do not call Phase 0 done.

## Shell
- [ ] Sidebar loads from menu.json + permissions
- [ ] Topbar shows logo, menu toggle, user menu, logout works
- [ ] Content outlet renders Optimus pages without broken padding/overflow
- [ ] Mobile: sidebar can open/close

## Optimus smoke (after shell + Tailwind)
- [ ] Campaign List
- [ ] Callback Logs (or one logs page)
- [ ] One masters list
- [ ] Login still works outside shell

## Revenue Report v2 (Spartan)
- [ ] No p-* / .pi in template
- [ ] Labels are nouns above controls (Date range, Telcom, …)
- [ ] Apply + Clear; cascade resets work
- [ ] Table scroll + Export Excel
- [ ] Loading / empty / error / validation visible

## Campaign add/edit (Spartan)
- [ ] No p-* / .pi in template
- [ ] Form sections + Save/Cancel
- [ ] Validation keeps values on fail
- [ ] Create and edit routes both work

## Dual-stack
- [ ] No hlm utilities required for Optimus pages to look OK
- [ ] No .pi icons on Spartan prototypes
```

- [ ] **Step 7: Verify build**

```bash
npm run build:staging
```

Expected: **PASS**. Fix peer dependency conflicts with `--legacy-peer-deps` only if Angular 22 peers block install; document in commit body if used.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json postcss.config.json components.json src/styles.css src/styles/spartan-theme.css docs/superpowers/plans/spartan-phase0-qa-checklist.md
# also add any helm paths created by the CLI (e.g. src/app/spartan-ui/** or libs/ui/**)
git add -A src/app/spartan-ui src/libs 2>/dev/null || true
git status
git commit -m "$(cat <<'EOF'
chore: add Tailwind v4 and Spartan NG foundation with Shemaroo tokens

EOF
)"
```

---

### Task 2: SharedSpartanModule + CMS wrappers

**Files:**
- Create: `src/app/shared/shared-spartan.module.ts`
- Create: `src/app/shared/cms-ui/cms-page-header.component.ts`
- Create: `src/app/shared/cms-ui/cms-filter-bar.component.ts`
- Create: `src/app/shared/cms-ui/cms-data-table.component.ts`
- Create: `src/app/shared/cms-ui/cms-form-section.component.ts`
- Create: `src/app/shared/cms-ui/cms-empty-state.component.ts`
- Create: `src/app/shared/cms-ui/cms-ui.module.ts`
- Test: `src/app/shared/cms-ui/cms-filter-bar.component.spec.ts` (optional pragmatic)

**Interfaces:**
- Consumes: helm button/input/label/separator/table/spinner from Task 1 paths
- Produces:
  - `CmsPageHeaderComponent` — `@Input() title: string`; content projection `actions`
  - `CmsFilterBarComponent` — outputs `apply` / `clear`; projects filter fields
  - `CmsDataTableComponent` — projects toolbar + table body; `@Input() loading`; `@Input() empty`
  - `CmsFormSectionComponent` — `@Input() title: string`; projects fields
  - `CmsEmptyStateComponent` — `@Input() title: string`; `@Input() description?: string`
  - `SharedSpartanModule` / `CmsUiModule` export all of the above + Common/Forms/Router + helm pieces

- [ ] **Step 1: Create wrapper components (standalone: false, NgModule era)**

`cms-page-header.component.ts`:

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'cms-page-header',
  template: `
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold tracking-tight text-foreground m-0">{{ title }}</h1>
      <div class="flex flex-wrap items-center gap-2">
        <ng-content select="[cmsActions]"></ng-content>
      </div>
    </div>
  `,
  standalone: false,
})
export class CmsPageHeaderComponent {
  @Input({ required: true }) title!: string;
}
```

`cms-filter-bar.component.ts`:

```typescript
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'cms-filter-bar',
  template: `
    <div class="mb-4 rounded-md border border-border bg-card p-4">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <ng-content></ng-content>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <button hlmBtn type="button" (click)="apply.emit()">Apply</button>
        <button hlmBtn type="button" variant="outline" (click)="clear.emit()">Clear</button>
        <ng-content select="[cmsFilterExtra]"></ng-content>
      </div>
    </div>
  `,
  standalone: false,
})
export class CmsFilterBarComponent {
  @Output() apply = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
}
```

Adjust `hlmBtn` selector/import to match whatever the CLI generated (often `HlmButtonDirective` with `hlmBtn`).

`cms-form-section.component.ts`:

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'cms-form-section',
  template: `
    <section class="mb-6 rounded-md border border-border bg-card p-4">
      <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground m-0">{{ title }}</h2>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <ng-content></ng-content>
      </div>
    </section>
  `,
  standalone: false,
})
export class CmsFormSectionComponent {
  @Input({ required: true }) title!: string;
}
```

`cms-empty-state.component.ts`:

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'cms-empty-state',
  template: `
    <div class="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <p class="text-base font-medium text-foreground m-0">{{ title }}</p>
      @if (description) {
        <p class="text-sm text-muted-foreground m-0 max-w-md">{{ description }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
  standalone: false,
})
export class CmsEmptyStateComponent {
  @Input({ required: true }) title!: string;
  @Input() description?: string;
}
```

`cms-data-table.component.ts`:

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'cms-data-table',
  template: `
    <div class="rounded-md border border-border bg-card">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <ng-content select="[cmsTableMeta]"></ng-content>
        </div>
        <div class="flex items-center gap-2">
          <ng-content select="[cmsTableActions]"></ng-content>
        </div>
      </div>
      @if (loading) {
        <div class="flex justify-center py-16"><ng-content select="[cmsLoading]"></ng-content></div>
      } @else if (empty) {
        <ng-content select="[cmsEmpty]"></ng-content>
      } @else {
        <div class="overflow-auto">
          <ng-content></ng-content>
        </div>
      }
    </div>
  `,
  standalone: false,
})
export class CmsDataTableComponent {
  @Input() loading = false;
  @Input() empty = false;
}
```

- [ ] **Step 2: Create CmsUiModule and SharedSpartanModule**

`cms-ui.module.ts` declares/exports the five wrappers and imports whatever helm modules/directives the CLI created (mirror import style from generated helm README / sibling apps).

`shared-spartan.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CmsUiModule } from './cms-ui/cms-ui.module';
// Import helm modules/directives generated in Task 1 and re-export them here.

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, CmsUiModule /* + helm */],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, CmsUiModule /* + helm */],
})
export class SharedSpartanModule {}
```

Do **not** import `SharedUiModule` (Optimus) into `SharedSpartanModule`.

- [ ] **Step 3: Build**

```bash
npm run build:staging
```

Expected: **PASS**.

- [ ] **Step 4: Commit**

```bash
git add src/app/shared/shared-spartan.module.ts src/app/shared/cms-ui
git commit -m "$(cat <<'EOF'
feat: add SharedSpartanModule and CMS layout wrappers

EOF
)"
```

---

### Task 3: Spartan admin shell

**Files:**
- Modify: `src/app/cms/layout/layout.component.ts`, `layout.component.html`
- Modify: `src/app/cms/layout/topbar/topbar/topbar.component.ts`, `topbar.component.html`
- Modify: `src/app/cms/layout/sidebar/sidebar/sidebar.component.ts`, `sidebar.component.html`
- Modify: `src/app/cms/layout/menu/menu/menu.component.ts`, `menu.component.html`
- Modify: `src/app/cms/layout/menu/menu/menuitem.component.ts` (+ html if present)
- Modify: `src/app/cms/layout/footer/footer/footer.component.ts`, `footer.component.html`
- Modify: `src/app/cms/layout/layout.module.ts`
- Modify: `src/app/cms/layout/layout.service.ts` (simplify; drop Sakai theme switcher coupling where unused)

**Interfaces:**
- Consumes: `SharedSpartanModule`; existing `menu.json` filter logic in `MenuComponent.getUserMenusByPermissions`
- Produces: Spartan shell that still calls the same logout / menu toggle / permission filtering behaviors; `router-outlet` for both Optimus and Spartan pages

- [ ] **Step 1: Switch LayoutModule to SharedSpartanModule for chrome**

In `layout.module.ts`, import `SharedSpartanModule` for shell components. Keep `SharedUiModule` **only if** some shell child still needs Optimus during transition; target end state of this task: shell templates have **zero** `p-*` / `pButton` / `p-tieredmenu`.

- [ ] **Step 2: Rewrite layout template**

Replace `layout.component.html` with a Tailwind shell (structure):

```html
<div class="flex min-h-screen bg-background text-foreground">
  <aside
    class="fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar transition-transform md:static md:translate-x-0"
    [class.-translate-x-full]="!sidebarOpen"
  >
    <app-sidebar></app-sidebar>
  </aside>
  <div class="flex min-w-0 flex-1 flex-col">
    <app-topbar (menuToggle)="toggleSidebar()"></app-topbar>
    <main class="flex-1 overflow-auto p-4 md:p-6">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  </div>
  @if (sidebarOpen) {
    <div class="fixed inset-0 z-30 bg-black/40 md:hidden" (click)="toggleSidebar()"></div>
  }
</div>
```

Update `layout.component.ts` to a smaller sidebar-open model (boolean + `toggleSidebar()`), preserving mobile dismiss on `NavigationEnd`. Remove dependence on Sakai `containerClass` / `p-ripple-disabled` classes.

- [ ] **Step 3: Rewrite topbar**

- Logo: `assets/images/shemaroo_logo.svg`
- Menu toggle button (Lucide `menu` / `panel-left`)
- User dropdown via Spartan `hlm-dropdown-menu` with Logout calling existing `logout()` method
- Remove `p-tieredmenu`, `pi pi-*`, and vestigial theme localStorage writes (`theme` / `saga-blue`) from `ngOnInit`

- [ ] **Step 4: Rewrite sidebar + menu + menuitem**

Keep TypeScript permission filtering in `menu.component.ts` intact. Replace templates with Tailwind nav links / nested groups. Use `routerLink` + `routerLinkActive` with Shemaroo primary active styles (`bg-sidebar-accent`, `text-sidebar-primary`).

- [ ] **Step 5: Simplify footer**

Plain text footer (copyright / app name) — no Optimus widgets.

- [ ] **Step 6: Build + smoke**

```bash
npm run build:staging
npm start
```

Manually: login → sidebar → open Campaign List (Optimus) → confirm usable. Check checklist Shell + Optimus smoke sections.

- [ ] **Step 7: Commit**

```bash
git add src/app/cms/layout
git commit -m "$(cat <<'EOF'
feat: replace Sakai chrome with Spartan admin shell

EOF
)"
```

---

### Task 4: Prototype A — Revenue Report v2 (Spartan)

**Files:**
- Modify: `src/app/cms/reports/revenue-report-v2/revenue-report-v2.component.html`
- Modify: `src/app/cms/reports/revenue-report-v2/revenue-report-v2.component.ts` (toast/icons only if needed; keep form + HTTP logic)
- Modify: reports feature module (add `SharedSpartanModule`; ensure this component’s module does not need Optimus for this template — if the module is shared across Optimus reports, import both modules at module level but keep **this template** Spartan-only)

**Interfaces:**
- Consumes: `CmsPageHeader`, `CmsFilterBar`, `CmsDataTable`, `CmsEmptyState`; existing `onSubmit()`, `downloadExcel()`, form controls, cascade `valueChanges`
- Produces: Spartan-only template at `/reports/revenue-report-v2`

- [ ] **Step 1: Confirm module imports**

Find the NgModule declaring `RevenueReportV2Component` (under `src/app/cms/reports/`). Add `SharedSpartanModule`. Leave `SharedUiModule` if sibling Optimus reports need it.

- [ ] **Step 2: Replace the HTML template**

Rewrite `revenue-report-v2.component.html` to this shape (map helm select/datepicker APIs to the actual generated selectors; keep `formControlName` names identical):

```html
<div class="mx-auto max-w-[1400px]">
  <cms-page-header title="Revenue Report"></cms-page-header>

  <form [formGroup]="revenueReportForm" (ngSubmit)="onSubmit()">
    <cms-filter-bar (apply)="onSubmit()" (clear)="clearFilters()">
      <div class="flex flex-col gap-1.5">
        <label hlmLabel for="revenue_date_range">Date range <span class="text-destructive">*</span></label>
        <!-- Spartan date range control bound to revenue_date_range; maxDate = maxDate -->
        @if (submitted && f['revenue_date_range'].hasError('required')) {
          <span class="text-sm text-destructive">Please select report date range</span>
        }
      </div>
      <div class="flex flex-col gap-1.5">
        <label hlmLabel for="revenue_telcom_id">Telcom <span class="text-destructive">*</span></label>
        <!-- hlm select: options=telcoms, optionLabel=tel_name, optionValue=tel_id -->
        @if (submitted && f['revenue_telcom_id'].hasError('required')) {
          <span class="text-sm text-destructive">Please select telcom</span>
        }
      </div>
      <div class="flex flex-col gap-1.5">
        <label hlmLabel for="revenue_master_aggregator">Master aggregator <span class="text-destructive">*</span></label>
        <!-- options=masterAggregator, maggregator_name / maggregator_id -->
      </div>
      <div class="flex flex-col gap-1.5">
        <label hlmLabel for="revenue_product_type">Product <span class="text-destructive">*</span></label>
        <!-- options=products, name / code -->
      </div>
      <div class="flex flex-col gap-1.5">
        <label hlmLabel for="revenue_service_id">Service</label>
        <!-- options=services, service_name / service_id, clearable -->
      </div>
    </cms-filter-bar>
  </form>

  @if (submitted && isValidForm) {
    <cms-data-table [empty]="!reports?.length">
      <div cmsTableMeta class="flex flex-wrap gap-3">
        @for (service of serviceWiseShare; track service) {
          <span>{{ service.service_name }} ({{ service.sel_revenue_share }}%)</span>
        }
      </div>
      <button cmsTableActions hlmBtn type="button" variant="outline" (click)="downloadExcel()">
        Export Excel
      </button>
      <cms-empty-state
        cmsEmpty
        title="No rows"
        description="No revenue rows for these filters."
      ></cms-empty-state>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border text-left">
            @for (col of cols; track col.key; let dateColumn = $first) {
              <th class="px-3 py-2 font-medium" [class.sticky]="dateColumn" [class.left-0]="dateColumn" [class.bg-card]="dateColumn">
                {{ col.header }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of reports; track row) {
            <tr class="border-b border-border">
              @for (col of cols; track col.key; let dateColumn = $first) {
                <td class="px-3 py-2" [class.sticky]="dateColumn" [class.left-0]="dateColumn" [class.bg-card]="dateColumn">
                  {{ row[col.key] }}
                </td>
              }
            </tr>
          }
        </tbody>
        @if (footerData) {
          <tfoot>
            <tr class="border-t border-border font-medium">
              @for (col of cols; track col.key; let dateColumn = $first) {
                <td class="px-3 py-2" [class.sticky]="dateColumn" [class.left-0]="dateColumn" [class.bg-card]="dateColumn">
                  {{ footerData[col.key] }}
                </td>
              }
            </tr>
          </tfoot>
        }
      </table>
    </cms-data-table>
  }
</div>
```

- [ ] **Step 3: Add `clearFilters()` in the component TS**

```typescript
clearFilters(): void {
  this.revenueReportForm.reset();
  this.submitted = false;
  this.isValidForm = false;
  this.cols = [];
  this.reports = [];
  this.footerData = {};
  this.serviceWiseShare = [];
  this.services = [];
  this.masterAggregator = [];
  this.products = [];
}
```

Keep `MessageService` for export toasts (global Optimus toast host is fine during strangler).

- [ ] **Step 4: Verify no Optimus in this template**

```bash
rg "p-|pi |pButton|pRipple|p-table|p-select|p-datepicker|p-divider" src/app/cms/reports/revenue-report-v2/revenue-report-v2.component.html
```

Expected: **no matches**.

- [ ] **Step 5: Build + manual QA**

```bash
npm run build:staging
```

Walk Revenue Report section of `spartan-phase0-qa-checklist.md`.

- [ ] **Step 6: Commit**

```bash
git add src/app/cms/reports/revenue-report-v2 src/app/cms/reports
git commit -m "$(cat <<'EOF'
feat: rebuild revenue report v2 on Spartan CMS patterns

EOF
)"
```

---

### Task 5: Prototype B — Campaign add/edit (Spartan)

**Files:**
- Modify: `src/app/cms/campaign/add-campaign/add-campaign.component.html` (~690 lines → Spartan)
- Modify: `src/app/cms/campaign/add-campaign/add-campaign.component.ts` only as needed for icons/toast/Clear; **do not** change submit API payloads
- Modify: `src/app/cms/campaign/campaign.module.ts` — import `SharedSpartanModule` (may keep `SharedUiModule` for sibling Optimus campaign pages)

**Interfaces:**
- Consumes: `CmsPageHeader`, `CmsFormSection`, helm form controls; existing reactive form group + `onSubmit` / cancel navigation
- Produces: Spartan-only templates for `/campaign/add` and `/campaign/edit`

- [ ] **Step 1: Inventory fieldsets in the current HTML**

```bash
rg -n "p-fieldset|legend|cms-|<h[1-6]|formControlName" src/app/cms/campaign/add-campaign/add-campaign.component.html | head -80
```

Map each existing fieldset/block to a `cms-form-section` title (noun phrases per UX spec).

- [ ] **Step 2: Control mapping (apply throughout the template)**

| Current Optimus | Spartan replacement |
|-----------------|---------------------|
| `p-select` | helm select |
| `p-multiSelect` | helm select multiple / multi-select if available; else checkbox list |
| `p-datepicker` | helm calendar + popover |
| `p-toggleswitch` / `p-toggleSwitch` | helm switch |
| `p-checkbox` | helm checkbox |
| `p-inputNumber` | hlm input `type="number"` |
| `input pInputText` | hlm input |
| `textarea` / `p-textarea` | helm textarea |
| `p-editor` (Quill) | **keep Quill** via existing editor integration **without** Optimus EditorModule if possible; if Quill is only wired through Optimus `Editor`, isolate a thin `CmsQuillEditor` wrapper that does not import other Optimus widgets into this template |
| `pButton` | `hlmBtn` |
| `pi pi-*` | `ng-icon` Lucide equivalents |

- [ ] **Step 3: Page chrome**

Top of template:

```html
<div class="mx-auto max-w-[1200px]">
  <cms-page-header [title]="isEdit ? 'Edit campaign' : 'Add campaign'">
    <div cmsActions class="flex gap-2">
      <button hlmBtn type="button" variant="outline" (click)="cancel()">Cancel</button>
      <button hlmBtn type="button" (click)="onSubmit()" [disabled]="saving">Save</button>
    </div>
  </cms-page-header>

  <form [formGroup]="/* existing form group property */" class="pb-24">
    <!-- cms-form-section per inventoried block -->
  </form>

  <div class="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
    <div class="mx-auto flex max-w-[1200px] justify-end gap-2">
      <button hlmBtn type="button" variant="outline" (click)="cancel()">Cancel</button>
      <button hlmBtn type="button" (click)="onSubmit()" [disabled]="saving">Save</button>
    </div>
  </div>
</div>
```

Wire `cancel()` to existing back navigation (same as today’s cancel/back if present; if missing, `this.router.navigate(['/campaign/list'])` or the real list path used elsewhere).

Use the component’s real property names for edit mode and form group (inspect TS — do not invent `isEdit` if the file already uses another flag such as `campaignId` / route snapshot).

- [ ] **Step 4: Convert sections incrementally in one PR**

Replace the entire HTML in one commit, section by section in the working tree, verifying after the full file that:

```bash
rg "p-|pi |pButton|pRipple|p-select|p-datepicker|p-fieldset|p-editor|p-checkbox|p-toggle" src/app/cms/campaign/add-campaign/add-campaign.component.html
```

Expected: **no matches** (Quill host element without Optimus selectors is OK).

- [ ] **Step 5: Preserve validation behavior**

Keep showing field errors when `submitted` (or existing flag) is true. On API failure, do not `reset()` the form.

- [ ] **Step 6: Build + manual QA**

```bash
npm run build:staging
```

Walk Campaign add/edit section of the Phase 0 checklist (create + edit).

- [ ] **Step 7: Commit**

```bash
git add src/app/cms/campaign/add-campaign src/app/cms/campaign/campaign.module.ts
git commit -m "$(cat <<'EOF'
feat: rebuild campaign add/edit form on Spartan CMS patterns

EOF
)"
```

---

### Task 6: Phase 0 exit gate

**Files:**
- Modify: `docs/superpowers/plans/spartan-phase0-qa-checklist.md` (check off completed items in a short status note, or leave unchecked for human QA)
- Create: `docs/superpowers/plans/spartan-rollout-notes.md` (short pointer for post–Phase 0)

**Interfaces:**
- Consumes: Tasks 1–5 deliverables
- Produces: Go / no-go for feature rollout

- [ ] **Step 1: Full checklist pass**

Run through every item in `spartan-phase0-qa-checklist.md` on staging build.

- [ ] **Step 2: Dual-stack grep gates**

```bash
rg "p-|pi " src/app/cms/reports/revenue-report-v2/revenue-report-v2.component.html
rg "p-|pi " src/app/cms/campaign/add-campaign/add-campaign.component.html
rg "hlm|CmsPageHeader|cms-" src/app/cms/campaign/campaign-list --glob '*.html' || true
```

Expected: prototypes clean of Optimus; Optimus list pages still Optimus (no accidental hlm bleed required).

- [ ] **Step 3: Write rollout notes**

Create `docs/superpowers/plans/spartan-rollout-notes.md`:

```markdown
# Spartan rollout notes (post Phase 0)

Phase 0 locked patterns on:
- Shell: src/app/cms/layout
- Wrappers: src/app/shared/cms-ui
- Report pattern: revenue-report-v2
- Form pattern: add-campaign

Next features: follow CMS UX tier order (lists → reports → complex forms → simple forms → auth).
Per feature: SharedSpartanModule only on that template; remove Optimus imports from that feature when clean.
Do not remove @openng/optimus-ui until final criteria in the design spec are met.
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/plans/spartan-phase0-qa-checklist.md docs/superpowers/plans/spartan-rollout-notes.md
git commit -m "$(cat <<'EOF'
docs: record Spartan Phase 0 exit gate and rollout notes

EOF
)"
```

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| Tailwind + Spartan brain/hlm alongside Optimus | Task 1 |
| Theme CSS vars light + dark-ready; Shemaroo primary | Task 1 (`#D51F53`) |
| Spartan shell; Optimus in outlet | Task 3 |
| CMS wrappers | Task 2 |
| `/reports/revenue-report-v2` Spartan | Task 4 |
| `/campaign/add` + `/edit` Spartan | Task 5 |
| One stack per template / bleed = failure | Tasks 3–6 + checklist |
| Services/API/auth unchanged | All tasks (constraint) |
| No dark toggle; Theme product out of scope | Global constraints |
| QA lock-in + Optimus smoke | Tasks 3, 4, 5, 6 |
| Final Optimus removal | Deferred (rollout notes only) |

**Placeholder scan:** Helm selector names may differ slightly by CLI version — implementers must bind to generated `hlm*` APIs from Task 1 paths, not invent alternate libraries.

**Type consistency:** Wrapper selectors `cms-page-header`, `cms-filter-bar`, `cms-data-table`, `cms-form-section`, `cms-empty-state` are the names Tasks 4–5 consume.
