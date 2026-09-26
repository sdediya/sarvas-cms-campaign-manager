# PrimeNG / live visual parity notes

**Source:** production read-only walkthrough  
`https://livecampaignmaanager.selvasportal.com:446/` (2026-09-26)

**Constraint:** Production is read-only — no create/edit/save while referencing.

## Measured live tokens

| Token | Live value |
|-------|------------|
| `--primary-color` | `#6366F1` (indigo) |
| `--surface-ground` | `#eff3f8` |
| `--surface-card` | `#ffffff` |
| `--text-color` | `#495057` |
| Root font size | `12px` (Sakai scale) |

## Chrome (Sakai)

- Full-width white topbar: logo left, hamburger, sun (theme stub), user icon right
- Floating white sidebar card under topbar (not edge-flush full-height rail)
- Menu: section headers (uppercase) + `pi` line icons + chevrons
- Active link: indigo text
- Footer: “Powered By: Shemaroo Entertainment Limited”
- Content ground `#eff3f8` with white `.card` panels

## Revenue Report v2

- Title `Revenue Report` in white card
- Labels: `Select Date Range *`, `Select Telcom *`, etc.
- Date range: single calendar input + indigo trigger
- Dropdowns with placeholders; primary **Submit** (not Apply/Clear)
- Empty until submit

## Access notes

- Direct `/campaign/list` and `/campaign/add` returned **No Access** for the provided user via URL (menu still lists them). Parity work uses Revenue Report + shell as primary visual reference; campaign form parity from local Optimus templates + prior screenshots.

## Goal (Option A)

Keep Spartan under the hood; match this live PrimeNG/Sakai look (indigo + Sakai chrome), not Shemaroo magenta redesign.
