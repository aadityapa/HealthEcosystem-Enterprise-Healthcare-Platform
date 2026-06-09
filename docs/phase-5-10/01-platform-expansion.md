# Phases 5–10 — Platform Expansion

## Overview

Phases 5 through 10 complete the HealthEcosystem platform with inventory management, quality control, CRM, EHR/PMS, patient mobile app, and ABDM/FHIR integration.

## Services

| Phase | Service | Port | Tests |
|-------|---------|------|-------|
| 5 | inventory-service | 3009 | 18+ |
| 6 | qc-service | 3010 | 21+ |
| 7 | crm-service | 3011 | 19+ |
| 8 | ehr-service | 3012 | 17+ |
| 9 | patient-mobile | 3110 | — |
| 10 | abdm-service | 3013 | 16+ |

## Phase 5 — Inventory & Reagent Management

### Features
- Reagents, kits, consumables (InventoryItem with itemType)
- Vendor management
- Purchase orders with approve/receive workflow
- Stock transfers between branches
- Lot tracking with expiry alerts
- Auto status: EXPIRED, LOW_STOCK, AVAILABLE

### API
`/api/v1/inventory/vendors`, `/items`, `/lots`, `/purchase-orders`, `/transfers`

## Phase 6 — Quality Control

### Features
- QC materials with target mean/SD
- QC runs with data point recording
- Westgard rules: 1-2s, 1-3s, 2-2s, R-4s, 4-1s, 10x
- Levey-Jennings charts
- Calibration logs
- QC failures → CAPA workflows

### API
`/api/v1/qc/materials`, `/runs`, `/calibration`, `/capa`, `/charts/levey-jennings/:materialId`

## Phase 7 — CRM & B2B Sales

### Features
- Doctor referral management with commission calculation
- Corporate leads pipeline
- Health camps with registrations
- Sales leads with activity tracking
- Sales targets and dashboard

### API
`/api/v1/crm/doctors`, `/referrals`, `/camps`, `/leads`, `/sales`

## Phase 8 — EHR + PMS

### Features
- Doctor profiles
- Appointments (schedule, check-in, cancel)
- Consultations with clinical notes
- Prescriptions with line items
- Telemedicine sessions

### API
`/api/v1/ehr/doctors`, `/appointments`, `/consultations`, `/prescriptions`, `/telemedicine`

## Phase 9 — Patient Mobile App

Next.js mobile-first app at port 3110.

### Screens
- Home dashboard with health timeline
- Report download
- Online test booking
- Home collection scheduling
- Payment tracking
- Health timeline
- Phone + OTP login (demo OTP: 123456)

## Phase 10 — ABDM + FHIR Integration

### Features
- ABHA profile linking and verification
- Consent manager (request, grant, revoke)
- FHIR R4 resource storage and Bundle support
- Health record exchange with HIU callback stub
- ABDM transaction logging

### API
`/api/v1/abdm/abha`, `/consent`, `/fhir`, `/exchange`

Public routes: FHIR endpoints, HIU webhook callback.

## Database Schemas

| Schema | Tables |
|--------|--------|
| inventory | vendors, inventory_items, stock_lots, purchase_orders, purchase_order_lines, stock_transfers, stock_transfer_lines |
| qc | qc_materials, qc_runs, qc_data_points, westgard_violations, calibration_logs, qc_failures, capa_records |
| crm | referring_doctors, doctor_referrals, corporate_leads, camps, camp_registrations, sales_leads, sales_activities, sales_targets |
| ehr | ehr_doctors, appointments, consultations, clinical_notes, prescriptions, prescription_lines, teleconsult_sessions |
| abdm | abha_profiles, health_record_links, consent_artifacts, fhir_resources, abdm_transactions |

## UI (web-admin)

30 new pages across Inventory (8), QC (6), CRM (6), EHR (5), ABDM (5).

## Run

```bash
pnpm install
pnpm db:generate && pnpm db:push && pnpm db:seed
pnpm --filter @health/inventory-service dev   # :3009
pnpm --filter @health/qc-service dev            # :3010
pnpm --filter @health/crm-service dev           # :3011
pnpm --filter @health/ehr-service dev           # :3012
pnpm --filter @health/abdm-service dev          # :3013
pnpm --filter @health/patient-mobile dev        # :3110
```

Or: `docker compose up --build`
