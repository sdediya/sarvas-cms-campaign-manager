# UX QA Checklist (Optimus migration)

Pass/fail per screen. Fail = do not merge.

## Global
- [x] Light background (not black / not OS-dark)
- [x] No "Invalid PrimeUI License" badge
- [x] Body text readable dark-on-light
- [x] Primary actions green/teal; danger red; no empty colored blocks
- [x] Form labels above inputs; required * in red
- [x] Filter rows: controls sized, not stretched edge-to-edge without need
- [x] Tables: header distinct; row separators; hover wash
- [x] Paginator never shows NaN (use `0 of 0` when empty)
- [x] Search icon does not overlap placeholder text
- [x] Toast/dialog readable on light surface

## Screens (minimum)
- [x] Login — Sign In label visible; card centered
- [x] Add Campaign — fieldsets aligned; Options trash/plus icons; Cancel danger with label
- [x] Campaign List — search + export; edit icons
- [x] Blacklist Configuration List — filters, search, paginator, delete icon
- [x] Callback Logs — date/telcom/partner row + Submit
- [x] One report page (e.g. Revenue or Live Dashboard) — Submit + Excel export icon

Verification: Login was runtime-checked from the staging bundle at 1920×1080. Authenticated screens were verified from their templates, shared compatibility styles, initialized paginator totals, and a successful staging build.
