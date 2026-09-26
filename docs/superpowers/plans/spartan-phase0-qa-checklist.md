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
