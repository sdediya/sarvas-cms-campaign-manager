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
