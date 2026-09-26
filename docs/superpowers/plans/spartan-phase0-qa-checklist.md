# Spartan Phase 0 QA Checklist

Fail = do not call Phase 0 done.

## Status note (2026-09-26 — Task 6 exit gate)

**Verified by agent (build + rg), not interactive browser:**

| Gate | Result |
|------|--------|
| `npm run build:staging` | PASS (exit 0) |
| Prototypes free of Optimus widgets (`p-button` / `p-select` / `pi pi-*` etc.) | PASS — `revenue-report-v2` + `add-campaign` |
| Optimus list page still Optimus (no `hlm` / `CmsPageHeader` bleed) | PASS — `list-campaign` (brief path `campaign-list` does not exist) |
| Toast at app root / shell Spartan (Tasks 1–5) | Assumed from prior task commits on `8605555` |

**Still needs human interactive smoke** (deferred — no staging credentials in agent sessions across Tasks 3–6). Leave items below unchecked until walked on a real staging build:

- All Shell / Optimus smoke / Login items
- Revenue Report v2: labels, Apply/Clear, cascade, table scroll, Export, loading/empty/error/validation UX
- Campaign add/edit: form sections Save/Cancel, validation retain, create + edit routes in browser
- Dual-stack visual: Optimus pages look OK without hlm; no `.pi` icons visible on Spartan prototypes in UI

Do **not** treat Phase 0 as fully locked for product sign-off until the interactive rows are green.

---

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
- [x] No p-* / .pi in template *(rg: no Optimus widget/icon matches; note: naive `rg "p-|pi "` also hits Tailwind `gap-*`)*
- [ ] Labels are nouns above controls (Date range, Telcom, …)
- [ ] Apply + Clear; cascade resets work
- [ ] Table scroll + Export Excel
- [ ] Loading / empty / error / validation visible

## Campaign add/edit (Spartan)
- [x] No p-* / .pi in template *(rg: no Optimus widget/icon matches)*
- [ ] Form sections + Save/Cancel
- [ ] Validation keeps values on fail
- [ ] Create and edit routes both work

## Dual-stack
- [ ] No hlm utilities required for Optimus pages to look OK
- [x] No .pi icons on Spartan prototypes *(rg: no `.pi` / `pi pi-` in prototype templates)*
