# Phases 18–24 — Enterprise Completion

## Overview

Final enterprise layer: observability, data platform, workflows, documents, white-label SaaS, AI agents, and global i18n.

| Phase | Module | Service | Port |
|-------|--------|---------|------|
| 18 | Observability | observability-service | 3020 |
| 19 | Data Lake & Warehouse | data-platform-service | 3021 |
| 20 | Workflow Engine | workflow-service | 3022 |
| 21 | Document Management | dms-service | 3023 |
| 22 | White Label SaaS | branding-service | 3024 |
| 23 | AI Agent Ecosystem | agents-service | 3025 |
| 24 | Internationalization | i18n-service | 3026 |

## Phase 18 — Observability Platform

**Stack:** OpenTelemetry, Jaeger (`:16686`), Grafana (`:3200`)

| Feature | API |
|---------|-----|
| Distributed Tracing | `POST /api/v1/observability/traces/spans` |
| Service Maps | `GET /api/v1/observability/service-map` |
| SLA Monitoring | CRUD `/api/v1/observability/sla` |
| Error Budgets | `GET /api/v1/observability/sla/error-budgets` |
| Capacity Planning | `GET /api/v1/observability/capacity` |
| Grafana Dashboards | `GET /api/v1/observability/dashboards` |

## Phase 19 — Data Platform

```
Kafka → Data Lake (S3/MinIO) → Spark → Data Warehouse → BI / AI
```

| Module | API |
|--------|-----|
| Pipelines | CRUD `/api/v1/data/pipelines`, `POST :id/run` |
| Data Lake | `GET /api/v1/data/lake/objects`, `POST ingest` |
| Warehouse | `GET /api/v1/data/warehouse/tables`, `POST refresh` |
| Spark Jobs | `POST /api/v1/data/spark/jobs` |
| Regulatory Export | `GET /api/v1/data/exports/regulatory` |

**MinIO:** `:9002` (S3-compatible data lake)

## Phase 20 — Workflow Engine

BPMN workflows without code changes.

**Critical Result Example:**
```
Critical Result → Pathologist Review → Senior Review → Patient Notification
```

| API | Purpose |
|-----|---------|
| `/workflow/definitions` | BPMN XML definitions |
| `/workflow/instances/start` | Start workflow |
| `/workflow/tasks` | My tasks, complete, escalate |
| `/workflow/automation` | Event-triggered rules |

## Phase 21 — Document Management

| Feature | API |
|---------|-----|
| Upload & Version Control | `/dms/documents`, `/versions` |
| Digital Signatures | `POST /dms/documents/:id/sign` |
| OCR | `POST /dms/documents/:id/ocr` |
| Full-Text Search | `GET /dms/search?q=` |
| Retention & Legal Hold | `/dms/retention/expiring`, legal-hold |

## Phase 22 — White Label SaaS

```
Your Platform
 ├ Apollo Lab Brand
 ├ XYZ Diagnostics Brand
 └ ABC Healthcare Brand
```

| Feature | API |
|---------|-----|
| Tenant Branding | `/branding/brands` |
| Custom Themes | `/branding/themes/:tenantId` |
| Feature Toggles | `/branding/features` |
| Franchise Branding | `/branding/franchise` |
| Custom Mobile Apps | `/branding/mobile/:tenantId` |
| Domain Resolution | `GET /branding/resolve?domain=` (public) |

## Phase 23 — AI Agent Ecosystem

| Agent | Capabilities |
|-------|-------------|
| **Patient Agent** | Report explanation, appointment assistance, follow-up |
| **Doctor Agent** | Clinical summaries, prescription assistance |
| **Lab Agent** | QC analysis, device monitoring |
| **Management Agent** | Revenue insights, operational recommendations |

API: `/api/v1/agents/patient/chat`, `/doctor/chat`, `/lab/analyze`, `/management/insights`

## Phase 24 — Internationalization

| Country | Code | Currency |
|---------|------|----------|
| India | IN | INR |
| UAE | AE | AED |
| Saudi Arabia | SA | SAR |
| Singapore | SG | SGD |
| UK | GB | GBP |

| API | Purpose |
|-----|---------|
| `/i18n/countries` | Country compliance packs |
| `/i18n/translations` | Multi-language bundles |
| `/i18n/tenant-locale` | Per-tenant locale config |
| `/i18n/tax-rules/:countryCode` | Multi-country tax |
| `/i18n/currency/convert` | Multi-currency |

## Infrastructure

| Component | Port |
|-----------|------|
| Jaeger UI | 16686 |
| Grafana | 3200 |
| MinIO (S3) | 9002 / 9001 (console) |
| ClickHouse | 8123 |
| Superset | 8088 |

## Platform Scale

**31 microservices** · **3 mobile apps** · **100+ web-admin pages** · **450+ unit tests**
