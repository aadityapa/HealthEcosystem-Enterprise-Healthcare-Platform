# Phases 25–30 — Commercial Launch Readiness

## Overview

Final enterprise layer focused on **security, compliance, performance, production ops, customer success, and commercial launch** — addressing the real risks beyond software: audits, scale, onboarding, and partner ecosystem.

| Phase | Module | Service/App | Port |
|-------|--------|-------------|------|
| 25 | Security Operations (SOC) | security-service | 3027 |
| 26 | Performance Certification | load-testing/ | — |
| 27 | Production Kubernetes | infrastructure/kubernetes/ | — |
| 28 | Compliance & Regulatory | compliance-service | 3028 |
| 29 | Customer Success | customer-success-service | 3029 |
| 30 | Commercial Launch | commercial-service + partner-portal | 3030 / 3130 |

## Phase 25 — Enterprise Security Program

**security-service** — SOC for 31+ microservices.

| Capability | API |
|------------|-----|
| Security Dashboard | `GET /api/v1/security/dashboard` |
| SIEM Integration | `POST /api/v1/security/siem/ingest` |
| Threat Detection | `GET/POST /api/v1/security/threats` |
| Incident Management | CRUD `/api/v1/security/incidents` |
| Vulnerability Scanning | `/api/v1/security/vulnerabilities` |
| Penetration Test Tracking | `/api/v1/security/pentest` |
| Certificate Lifecycle | `/api/v1/security/certificates` |
| Secret Rotation | `/api/v1/security/secrets/rotate` |
| WAF / DDoS | `/api/v1/security/waf/status`, `/waf/block` |

**Audit targets:** ISO 27001, SOC 2 Type II, HIPAA readiness.

## Phase 26 — Performance Certification

See [02-performance-certification.md](./02-performance-certification.md)

| Metric | Target |
|--------|--------|
| Concurrent Users | 50,000+ |
| Orders / Hour | 50,000+ |
| Device Messages / Min | 100,000+ |
| Report Generation / Min | 10,000+ |
| API P95 | <200ms |

**Tools:** k6, Gatling — `infrastructure/load-testing/`

```bash
cd infrastructure/load-testing
npm run load:gateway:local
npm run load:lims:local
npm run load:devices:local
```

## Phase 27 — Production Kubernetes

See [03-kubernetes-production.md](./03-kubernetes-production.md)

**Stack:** EKS, ArgoCD, Istio, Karpenter, External Secrets, Velero, Crossplane

**Features:** Blue/green, canary releases, HPA, service mesh, multi-cluster DR.

```bash
kubectl apply -k infrastructure/kubernetes/overlays/production
```

## Phase 28 — Certification & Regulatory Pack

**compliance-service** — 8 frameworks seeded:

| Framework | Code |
|-----------|------|
| HIPAA | US healthcare |
| GDPR | EU privacy |
| DPDP | India privacy |
| ISO 27001 | Information security |
| SOC 2 | Trust services |
| NABL | Lab accreditation |
| CAP | College of American Pathologists |
| ABDM | India health stack |

Modules: packs, controls, audit evidence, risk register, policy management.

## Phase 29 — Customer Success Platform

| Module | Purpose |
|--------|---------|
| Onboarding | Tenant setup wizard with checklist |
| Migration | Data import jobs (patients, tests, results) |
| Training | Course enrollment and progress |
| Knowledge Base | Self-service articles |
| Support Tickets | SLA-tracked ticketing |
| SLA Dashboard | Customer-facing SLA view |

## Phase 30 — Commercial Launch Platform

**commercial-service** + **partner-portal** (`:3130`)

| Feature | API / App |
|---------|-----------|
| Subscription Plans | Starter, Professional, Enterprise, Franchise |
| Licensing | Tenant subscriptions + license keys |
| Quotation Generator | `/commercial/quotations` |
| Contract Management | Partner contracts |
| Partner Accounts | Franchise, hospital, chain, reseller |
| Revenue Dashboard | MRR, ARR |

**Partner types:** Franchise Owners, Hospitals, Diagnostic Chains, Resellers.

## Platform Scale (Final)

| Metric | Count |
|--------|-------|
| Microservices | **35** |
| Web/Mobile Apps | **4** (admin, patient, phlebotomist, partner) |
| Prisma Schemas | **27** |
| Web-admin Pages | **150+** |
| Unit Tests | **550+** |

## Risk Mitigation Matrix

| Risk | Phase | Solution |
|------|-------|----------|
| Security audits | 25 | SOC, SIEM, WAF, cert lifecycle |
| Regulatory compliance | 28 | 8 framework packs + evidence repo |
| Production scale | 26, 27 | Load cert + EKS/Istio/Karpenter |
| Customer onboarding | 29 | Onboarding wizard + migration tools |
| Partner ecosystem | 30 | Partner portal + commercial service |
| Clinical validation | 6, 20 | QC + critical result workflows |
| Device certification | 3 | Device integration platform |

## Run

```bash
pnpm db:generate && pnpm db:push && pnpm db:seed
docker compose up --build
```

| App | URL |
|-----|-----|
| Web Admin | http://localhost:3100 |
| Partner Portal | http://localhost:3130 |
| Jaeger | http://localhost:16686 |
| Grafana | http://localhost:3200 |
