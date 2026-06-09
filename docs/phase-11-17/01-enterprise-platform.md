# Phases 11–17 — Enterprise Platform Completion

## Overview

Phases 11–17 transform HealthEcosystem from a regional diagnostic platform into a **national-scale enterprise healthcare operating system**.

| Phase | Module | Service/App | Port |
|-------|--------|-------------|------|
| 11 | Analytics Platform | analytics-service | 3014 |
| 12 | AI Platform | ai-service | 3015 |
| 13 | Home Collection Ops | field-service + phlebotomist-app | 3016 / 3120 |
| 14 | PACS / RIS | radiology-service | 3017 |
| 15 | HRMS | hrms-service | 3018 |
| 16 | Marketplace | marketplace-service | 3019 |
| 17 | Multi-Region DR/HA | infrastructure | — |

## Phase 11 — Analytics Platform (Management Cockpit)

### Technology Stack
- **ClickHouse** — OLAP analytics warehouse (:8123)
- **Apache Superset** — BI dashboards (:8088)
- **Kafka Streams** — event ingestion (stub with PostgreSQL fallback)
- **Materialized Views** — registered via `/api/v1/analytics/views`

### Dashboards
| Endpoint | Analytics |
|----------|-----------|
| `/analytics/executive` | Revenue, orders, patients, branches KPIs |
| `/analytics/revenue` | Daily/monthly trends, branch breakdown |
| `/analytics/branches` | Branch comparison |
| `/analytics/tests` | Top tests, volume trends |
| `/analytics/referrals` | Doctor referral performance |
| `/analytics/qc` | QC failure rates, Westgard violations |
| `/analytics/devices` | Device uptime, message volume |
| `/analytics/predictive` | Demand/revenue forecasts |

ClickHouse unavailable → automatic PostgreSQL aggregation fallback.

## Phase 12 — AI Platform

### Clinical AI
- Abnormal result detection (z-score)
- Critical/panic value detection
- Smart interpretation
- Risk prediction

### Operational AI
- Inventory forecasting (moving average)
- Demand forecasting
- Revenue forecasting
- Staff planning

### Customer AI
- AI chat assistant (session-based)
- WhatsApp bot webhook
- Voice assistant (transcribe/respond stubs)

All inferences logged to `AiInferenceLog`.

## Phase 13 — Home Collection Operations

### field-service
- Phlebotomist management
- Route planning with nearest-neighbor optimization
- GPS tracking pings
- Collection proof (photo, signature, OTP, barcode)
- Attendance with geo-fence validation
- Geo-fence CRUD

### phlebotomist-app (:3120)
Mobile app: today's route, stop collection, attendance, GPS tracking.

## Phase 14 — PACS / RIS (Radiology)

### Modalities
X-Ray (XR), CT, MRI (MR), Ultrasound (US), Mammography (MG)

### Features
- RIS study scheduling and worklist
- DICOM C-STORE stub with tag parser
- PACS node configuration (AE Title, host, port)
- Radiology report create/verify/release
- DICOM series and instance tracking

## Phase 15 — HRMS

- Employee management
- Payroll runs with line items
- Attendance check-in/out
- Shift management and assignments
- Training records
- Certifications with expiry tracking

## Phase 16 — Marketplace & Partner Ecosystem

- Online test listings
- Partner lab network
- B2C and B2B orders
- Corporate wellness packages
- Camp bookings

## Phase 17 — Multi-Region DR & HA

See [02-multi-region-dr-ha.md](./02-multi-region-dr-ha.md)

## Commercial Readiness Matrix

| Segment | Status |
|---------|--------|
| Small Lab | Ready |
| Regional Diagnostic Chain | Ready |
| Multi-State Network | Ready |
| National Diagnostic Brand | Ready (with DR deployment) |

## Run

```bash
pnpm install
pnpm db:generate && pnpm db:push && pnpm db:seed
docker compose up clickhouse superset -d   # Analytics stack
pnpm --filter @health/analytics-service dev  # :3014
pnpm --filter @health/ai-service dev         # :3015
pnpm --filter @health/field-service dev        # :3016
pnpm --filter @health/radiology-service dev    # :3017
pnpm --filter @health/hrms-service dev         # :3018
pnpm --filter @health/marketplace-service dev  # :3019
pnpm --filter @health/phlebotomist-app dev     # :3120
```

| App | URL |
|-----|-----|
| Superset BI | http://localhost:8088 |
| ClickHouse | http://localhost:8123 |
| Phlebotomist App | http://localhost:3120 |
