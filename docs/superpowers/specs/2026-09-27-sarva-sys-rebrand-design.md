# Sarva Sys rebrand and SME removal

Remove every Shemaroo / ShemarooMe / SME reference from the CMS frontend.
Visible branding becomes "Sarva Sys"; code-level identifiers use the neutral
name `company`. The SME product is discontinued, so SME-only features are
removed and report product filters are fixed to `legacy`.

## 1. Visible branding

| Where | Before | After |
|---|---|---|
| `index.html` title | Shemaroo \| Campaign Manager | Sarva Sys \| Campaign Manager |
| `environment.prod.ts` / `environment.staging.ts` title | ShemarooMe VAS (\| CMS) | Sarva Sys VAS (\| CMS) |
| Footer, campaign theme / landing preview | Powered by Shemaroo Entertainment Limited | Powered by Sarva Sys |
| Topbar, login, campaign previews | `assets/images/shemaroo_logo.svg` | `assets/images/company_logo.svg` |
| Campaign theme / landing toggle | Show ShemarooMe Logo | Show Sarva Sys Logo |
| Add Operator lifecycle option | Shemaroo | Sarva Sys |
| Add Operator revenue column | Shemaroo Revenue (%) | Sarva Sys Revenue (%) |

`company_logo.svg` is a text wordmark placeholder until final artwork is supplied.

## 2. Neutral identifiers (backend contract changes)

| Before | After |
|---|---|
| `tel_lifecycle_managed_by = 'shemaroo'` | `'company'` |
| `tel_services[].shemaroo_revenue` | `tel_services[].company_revenue` |
| Theme preview key `shemaroo_logo` | `company_logo` |

## 3. SME features removed

- ShemarooME OTP Summary and OTP Service API Logs pages (`reports/shemaroome-otp/`),
  their routes, module declarations and menu entries. `logs/sme-service-api-logs`
  is no longer called.
- Add Operator: "Ageing Calculation for SME". `tel_ageing_calculation` is sent as
  `{"legacy": "<value>"}` only.
- Add Plan: the `sme_plan_id` values on the plan validity list and the
  service-name lookup. Service Plan ID stays (still required) but its field is
  renamed `plan_smeplan_id` → `plan_service_plan_id`.
- Add Campaign: Redirection requirement tied to `SHEMAROOME_SERVICE_ID`, the
  "Auto Login to Shemaroome" option and the `shemaroome.com` redirect option.
  `SHEMAROOME_SERVICE_ID` is removed from all environment files.
- Customer Care / Customer Refund: SME Order ID line.

## 4. Report product filter

The Legacy/SME product (service type) dropdown is removed from these reports; the
form value is fixed to `legacy`, so requests always send Legacy. In the v2
reports, partner and service dropdowns only list Legacy entries:

- Revenue Report, Revenue Report v2
- Ageing Summary / Dump / Partner-wise Summary (v1 and v2)
- Operator Revenue Calculator
- Investor Report

Oneshot View Report's product multiselect lists real products and is unchanged.

## 5. Backend handoff

The backend must ship these alongside the frontend:

1. Accept `company` wherever `shemaroo` is accepted for `tel_lifecycle_managed_by`,
   and migrate stored `'shemaroo'` values to `'company'`.
2. Accept `company_revenue` instead of `shemaroo_revenue` in operator services
   (request and response), and migrate stored data.
3. Accept `plan_service_plan_id` instead of `plan_smeplan_id` on plan
   create/update and in plan responses, and migrate the column.
4. Accept `tel_ageing_calculation` with only the `legacy` key.
5. `logs/sme-service-api-logs` has no frontend caller and can be retired.
6. Report endpoints always receive `legacy` as the product/service type.
