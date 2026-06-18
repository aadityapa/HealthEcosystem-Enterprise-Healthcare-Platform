# HealthEcosystem — Enterprise Healthcare Platform

[![Repository](https://img.shields.io/badge/GitHub-HealthEcosystem-blue)](https://github.com/aadityapa/HealthEcosystem-Enterprise-Healthcare-Platform)

Production-ready, multi-tenant Healthcare SaaS platform: **LIMS**, **EHR**, **PMS**, **Billing & RCM**, **Device Integration**, **ABDM/FHIR**, **Analytics**, **AI**, **Radiology (PACS/RIS)**, **Home Collection**, **Security SOC**, **Compliance**, and **Commercial Partner Portal**.

Built as a **pnpm monorepo** with **31 NestJS microservices**, **4 frontend apps**, **27 PostgreSQL schemas**, and **150+ admin UI pages**.

---

## Platform at a Glance

| Dimension | Details |
|-----------|---------|
| **Microservices** | 31 services (ports 3000–3030) |
| **Applications** | web-admin (3100), patient-mobile (3110), phlebotomist-app (3120), partner-portal (3130) |
| **Database** | PostgreSQL 16 — 27 Prisma schemas with row-level tenant isolation |
| **Event Bus** | Kafka (optional locally; in-memory fallback for dev) |
| **Cache** | Redis — sessions, rate limiting, device retry queues |
| **Analytics** | ClickHouse + Apache Superset |
| **Compliance** | HIPAA, GDPR, DPDP, ISO 27001, SOC 2, NABL, CAP, ABDM |
| **Phases** | 1–30 complete · Go-to-Market in progress |

### Interactive Architecture Canvas

Open the full interactive architecture diagram in Cursor:

**[canvases/healthcare-ecosystem-architecture.canvas.tsx](./canvases/healthcare-ecosystem-architecture.canvas.tsx)**

Includes: service map, golden workflows, device vendors, K8s production stack, pricing tiers, compliance frameworks, verification commands, and pilot readiness scorecard.

---

## All Services & Ports

| Service | Port | Domain |
|---------|------|--------|
| api-gateway | 3000 | JWT auth, rate limit, routing, CORS |
| identity-service | 3001 | Auth, MFA, JWT, sessions, RBAC |
| tenant-service | 3002 | Tenants, orgs, branches, franchise |
| patient-service | 3003 | UHID, family, consent, timeline |
| lims-service | 3004 | Orders, samples, results, reports, TAT |
| audit-service | 3005 | Immutable audit trail |
| device-service | 3006 | ASTM/HL7/FHIR/DICOM, 5 vendor adapters |
| master-data-service | 3007 | Test catalog, panels, pricing, GST |
| billing-service | 3008 | Invoices, GST, Razorpay/Cashfree/PayU |
| inventory-service | 3009 | Reagents, PO, stock transfer, expiry |
| qc-service | 3010 | Westgard rules, CAPA, calibration |
| crm-service | 3011 | Referrals, camps, B2B sales |
| ehr-service | 3012 | Appointments, consults, prescriptions |
| abdm-service | 3013 | ABHA, consent, FHIR R4, HIP/HIU |
| analytics-service | 3014 | ClickHouse, Superset, executive BI |
| ai-service | 3015 | Clinical + operational ML inference |
| field-service | 3016 | Home collection routes, GPS |
| radiology-service | 3017 | PACS/RIS, DICOM, study workflow |
| hrms-service | 3018 | Employees, payroll, attendance |
| marketplace-service | 3019 | Reagent marketplace, partner orders |
| observability-service | 3020 | OTel, Jaeger, Grafana, SLA |
| data-platform-service | 3021 | Data lake, pipelines, warehouse |
| workflow-service | 3022 | BPMN engine, critical result flow |
| dms-service | 3023 | Documents, OCR, e-sign, retention |
| branding-service | 3024 | White-label, custom domain |
| agents-service | 3025 | AI agents — patient, doctor, lab, ops |
| i18n-service | 3026 | Locales, currency, translations |
| security-service | 3027 | SOC, SIEM, WAF, certs, pentest |
| compliance-service | 3028 | 8 frameworks, evidence, risk register |
| customer-success-service | 3029 | Onboarding, migration, SLA, tickets |
| commercial-service | 3030 | Plans, licensing, quotes, revenue |

### Applications

| App | Port | Users |
|-----|------|-------|
| web-admin | 3100 | Lab admins, pathologists, billing, ops (150+ pages) |
| patient-mobile | 3110 | Patients — reports, booking, payments |
| phlebotomist-app | 3120 | Field collection, GPS, routes |
| partner-portal | 3130 | Franchise, hospitals, resellers, sales |

---

## Golden Workflows

| Workflow | Steps |
|----------|-------|
| **Diagnostic** | Register → Order → Bill → Collect → Device Import → QC → Verify → Release → WhatsApp → Mobile |
| **Home Collection** | Book → Route → Phlebotomist Accept → GPS → Collect → Lab Receipt → Report |
| **Radiology** | Appointment → DICOM Study → PACS → Report → Verify → Release |

---

## Quick Start

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **PostgreSQL** 16+ (local or Docker)
- **Redis** (local or Docker)
- **Docker** (optional — for full infra: Kafka, ClickHouse, Elasticsearch)

### Option A — Docker (Full Stack)

```bash
pnpm install
cp .env.example .env
docker compose up --build
```

### Option B — Local Dev (Windows / macOS / Linux)

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# For Prisma, also copy to packages/db:
cp .env packages/db/.env

# Database setup
pnpm db:generate
pnpm db:push
pnpm db:seed

# Start backend (31 services)
# On Windows PowerShell — load .env first:
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    Set-Item -Path "env:$($matches[1].Trim())" -Value $matches[2].Trim()
  }
}
pnpm dev

# Start web admin (separate terminal)
pnpm --filter @health/web-admin dev
```

> **Note:** Leave `KAFKA_BROKERS=` empty in `.env` for local dev without Docker/Kafka. Event publishing falls back to in-memory mode.

### URLs

| Service | URL |
|---------|-----|
| Web Admin | http://localhost:3100 |
| API Gateway | http://localhost:3000 |
| Partner Portal | http://localhost:3130 |
| Patient Mobile | http://localhost:3110 |
| Identity API Docs | http://localhost:3001/docs |
| LIMS API Docs | http://localhost:3004/docs |

### Demo Credentials

```
Email:    admin@demolab.com
Password: Admin@123456
Tenant:   demo-lab
```

---

## Verification & Go-to-Market

```bash
pnpm verify:pilot              # Production readiness scorecard (90%+ target)
pnpm verify:tenant-isolation   # 1000+ multi-tenant isolation tests
pnpm verify:golden-workflows   # E2E diagnostic / home collection / radiology
pnpm verify:billing-accuracy   # GST CGST/SGST/IGST validation
pnpm verify:device-import      # 5 vendor adapter certification
pnpm verify:security           # Pre-VAPT internal checks
pnpm verify:performance        # k6 smoke + certification targets
pnpm verify:all                # Core verification suites
```

| Initiative | Document |
|------------|----------|
| Technical Due Diligence | [docs/go-to-market/01-technical-due-diligence.md](docs/go-to-market/01-technical-due-diligence.md) |
| Security Audit (VAPT) | [docs/go-to-market/02-security-audit.md](docs/go-to-market/02-security-audit.md) |
| Clinical Validation | [docs/go-to-market/03-clinical-validation.md](docs/go-to-market/03-clinical-validation.md) |
| NABL Pilot Program | [docs/go-to-market/04-nabl-pilot-program.md](docs/go-to-market/04-nabl-pilot-program.md) |
| Pricing Strategy | [docs/go-to-market/05-pricing-strategy.md](docs/go-to-market/05-pricing-strategy.md) |
| Production Readiness | [docs/go-to-market/07-production-readiness-checklist.md](docs/go-to-market/07-production-readiness-checklist.md) |
| Pilot Pre-Flight | [docs/go-to-market/08-pilot-pre-flight.md](docs/go-to-market/08-pilot-pre-flight.md) |
| Production Scorecard | [docs/go-to-market/11-production-scorecard.md](docs/go-to-market/11-production-scorecard.md) |

---

## Documentation Index

Full architecture and implementation docs: **[docs/README.md](./docs/README.md)**

| Phase | Document | Description |
|-------|----------|-------------|
| 1 | [System Architecture](docs/phase-1/01-system-architecture.md) | Layers, data flows, integration patterns |
| 1 | [ER Diagram](docs/phase-1/02-er-diagram.md) | Entity-relationship model (Mermaid) |
| 1 | [Database Schema](docs/phase-1/03-database-schema.md) | PostgreSQL DDL, indexes, RLS |
| 1 | [User Roles & Permissions](docs/phase-1/04-user-roles-permissions.md) | RBAC matrix, MFA policies |
| 1 | [Multi-Tenant Architecture](docs/phase-1/05-multi-tenant-architecture.md) | Tenant isolation, franchise hierarchy |
| 1 | [API Architecture](docs/phase-1/06-api-architecture.md) | REST, GraphQL, WebSocket, FHIR |
| 1 | [Microservices Architecture](docs/phase-1/07-microservices-architecture.md) | Service boundaries, CQRS, event bus |
| 1 | [Infrastructure & DevOps](docs/phase-1/08-infrastructure-devops.md) | AWS, K8s, Terraform, CI/CD |
| 3 | [Device Integration](docs/phase-3/01-device-integration.md) | ASTM, HL7, vendor adapters |
| 4 | [Master Data & Billing](docs/phase-4/01-master-data-and-billing.md) | Catalog, GST, payment gateways |
| 5–10 | [Platform Expansion](docs/phase-5-10/01-platform-expansion.md) | Inventory, QC, CRM, EHR, ABDM |
| 11–17 | [Enterprise Platform](docs/phase-11-17/01-enterprise-platform.md) | Analytics, AI, radiology, HRMS |
| 11–17 | [Multi-Region DR & HA](docs/phase-11-17/02-multi-region-dr-ha.md) | Mumbai/Hyderabad DR |
| 18–24 | [Enterprise Completion](docs/phase-18-24/01-enterprise-completion.md) | Observability, workflow, DMS, i18n |
| 25–30 | [Commercial Launch](docs/phase-25-30/01-commercial-launch.md) | SOC, K8s, compliance, partner portal |
| 25–30 | [Performance Certification](docs/phase-25-30/02-performance-certification.md) | k6, Gatling load tests |
| 25–30 | [Kubernetes Production](docs/phase-25-30/03-kubernetes-production.md) | EKS, ArgoCD, Istio |

---

## Monorepo Structure

```
HealthEcosystem/
├── backend/
│   ├── api-gateway/              # API Gateway (:3000)
│   └── services/                 # 31 NestJS microservices (:3001–:3030)
├── frontend/
│   ├── web-admin/                # Admin Portal (:3100)
│   ├── patient-mobile/           # Patient app (:3110)
│   ├── phlebotomist-app/         # Field collection (:3120)
│   └── partner-portal/           # Partner portal (:3130)
├── packages/
│   ├── db/                       # Prisma — 27 schemas
│   ├── design-system/            # UI components & tokens
│   ├── shared-types/             # Domain types & events
│   ├── validation/               # DTOs & validators
│   ├── events/                   # Event publisher abstraction
│   ├── auth-sdk/                 # Auth utilities
│   └── logger/                   # Structured logging (Pino)
├── canvases/
│   └── healthcare-ecosystem-architecture.canvas.tsx  # Interactive architecture
├── docs/                         # Phase 1–30 + Go-to-Market docs
├── scripts/                      # Verification scripts (verify-*.mjs)
├── infrastructure/
│   ├── docker/                   # Base Dockerfiles
│   └── kubernetes/               # K8s manifests (EKS, ArgoCD, Istio)
├── docker-compose.yml
└── turbo.json
```

---

## Device Integration

```
Instrument → Gateway → Protocol Handler → Integration Engine
  → Vendor Adapter → Result Processor → Clinical Validation → LIMS Import
```

| Vendor | Protocol | Models |
|--------|----------|--------|
| Roche | HL7 v2 (MLLP) | Cobas c501/c502 |
| Abbott | ASTM E1381 | Architect ci8200 |
| Siemens | HL7 v2 | Atellica |
| Sysmex | HL7 v2 | XN-Series |
| Beckman Coulter | ASTM E1381 | AU5800 |

---

## Pricing Tiers (India Market)

| Tier | Code | Monthly | Branches | Users |
|------|------|---------|----------|-------|
| Small Lab | SMALL_LAB | ₹25,000 | 1 | 10 |
| Diagnostic Center | DIAGNOSTIC_CENTER | ₹1,25,000 | 3 | 50 |
| Multi-Branch Chain | MULTI_BRANCH | ₹7,50,000 | 25 | 250 |
| White Label Enterprise | WHITE_LABEL | ₹20L+/yr | 100 | 1000 |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, TypeScript, Tailwind, React Query, Zustand, Framer Motion |
| **Backend** | NestJS, CQRS, DDD, Prisma ORM |
| **Database** | PostgreSQL 16 (multi-schema), Redis, ClickHouse |
| **Messaging** | Kafka, domain events |
| **Observability** | OpenTelemetry, Jaeger, Grafana |
| **DevOps** | Docker, Kubernetes (EKS), ArgoCD, Istio, GitHub Actions |
| **Compliance** | ABDM, FHIR R4, HL7 v2, ASTM, DICOM |

---

## Testing

```bash
pnpm test                                    # All unit tests
pnpm --filter @health/lims-service test      # Single service
pnpm verify:tenant-isolation                 # 1000+ isolation tests
```

---

## API Overview

All APIs route through the gateway at `http://localhost:3000`:

```
POST   /api/v1/auth/login
GET    /api/v1/patients
POST   /api/v1/lims/orders
POST   /api/v1/lims/samples/:id/results
PATCH  /api/v1/lims/results/:id/verify
POST   /api/v1/billing/invoices
GET    /api/v1/devices
POST   /api/v1/devices/ingest/:deviceId
GET    /api/v1/analytics/executive
GET    /api/v1/security/incidents
GET    /api/v1/commercial/plans
```

---

## License

Proprietary — All rights reserved.

## Author

**Aaditya PA** — [GitHub](https://github.com/aadityapa)
