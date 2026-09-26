# Spartan rollout notes (post Phase 0)

Phase 0 locked patterns on:
- Shell: src/app/cms/layout
- Wrappers: src/app/shared/cms-ui
- Report pattern: revenue-report-v2
- Form pattern: add-campaign

Next features: follow CMS UX tier order (lists → reports → complex forms → simple forms → auth).
Per feature: SharedSpartanModule only on that template; remove Optimus imports from that feature when clean.
Do not remove @openng/optimus-ui until final criteria in the design spec are met.
