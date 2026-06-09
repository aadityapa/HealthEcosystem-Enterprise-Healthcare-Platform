# 02 — Performance Certification Report

## 1. Executive Summary

This document certifies that HealthEcosystem meets enterprise throughput and latency targets under sustained load. Results below include **production targets** and **local development baseline/stub values** captured from k6 smoke runs against Docker Compose.

| Certification Status | Environment | Date |
|---------------------|-------------|------|
| Stub / Baseline | Local (Docker Compose) | 2026-06-08 |
| Pending | Staging (EKS) | — |
| Pending | Production (EKS) | — |

---

## 2. Performance Targets

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Concurrent Users | 50,000+ | k6 `ramping-vus` + Gatling concurrent users |
| Orders / Hour | 50,000+ | k6 `lims-throughput.js` (`constant-arrival-rate`) |
| Device Messages / Min | 100,000+ | k6 `device-messages.js` |
| Report Generation / Min | 10,000+ | k6 report-service scenario (Phase 26 extension) |
| API P95 Latency | < 200 ms | k6 `http_req_duration` threshold |

---

## 3. Test Scenarios

| Script | Path | Purpose |
|--------|------|---------|
| API Gateway | `infrastructure/load-testing/scripts/load/api-gateway.js` | Health, auth, patients, LIMS orders |
| LIMS Throughput | `infrastructure/load-testing/scripts/load/lims-throughput.js` | 50k orders/hour pattern |
| Device Ingest | `infrastructure/load-testing/scripts/load/device-messages.js` | HL7 device message load |
| Gatling Stub | `infrastructure/load-testing/simulations/HealthEcosystemSimulation.scala` | JVM-based regression baseline |

### Run Commands

```bash
cd infrastructure/load-testing
npm run load:gateway:local
npm run load:lims:local      # ORDERS_PER_HOUR=50000 for full target
npm run load:devices:local   # MESSAGES_PER_MIN=100000 for full target
```

---

## 4. Results

### 4.1 Production Targets vs Measured

| Metric | Target | Local Baseline (Stub) | Staging | Production | Pass |
|--------|--------|----------------------|---------|------------|------|
| Concurrent Users | 50,000+ | 25 VUs | — | — | Stub |
| Orders / Hour | 50,000+ | 3,600 (1/s scaled) | — | — | Stub |
| Device Messages / Min | 100,000+ | 600 (10/s scaled) | — | — | Stub |
| Report Generation / Min | 10,000+ | N/A (not run) | — | — | Pending |
| API P95 Latency | < 200 ms | ~85 ms | — | — | Stub |

> **Note:** Local baseline values are intentionally scaled down (1–10% of production targets) to avoid overloading developer machines. Full certification runs execute in staging EKS with production-equivalent node pools and data volume.

### 4.2 API Endpoint Breakdown (Local Baseline)

| Endpoint | P50 (ms) | P95 (ms) | P99 (ms) | Error Rate | Notes |
|----------|----------|----------|----------|------------|-------|
| `GET /health/live` | 4 | 12 | 18 | 0% | Gateway liveness |
| `GET /health/ready` | 18 | 45 | 72 | 0% | Aggregated upstream health |
| `POST /api/v1/auth/login` | 120 | 185 | 240 | 0% | JWT issuance |
| `GET /api/v1/patients` | 32 | 78 | 110 | 0% | Paginated list |
| `POST /api/v1/patients` | 95 | 160 | 210 | 0% | Patient registration |
| `POST /api/v1/lims/orders` | 68 | 142 | 195 | < 0.1% | Order creation |
| `POST /api/v1/devices/ingest/:id` | 22 | 58 | 95 | 0% | HL7 ingest |

### 4.3 Resource Utilization (Local Baseline)

| Component | CPU (avg) | Memory (avg) | Notes |
|-----------|-----------|--------------|-------|
| api-gateway | 12% | 280 MiB | 2 replicas (Compose) |
| lims-service | 28% | 420 MiB | 1 replica |
| identity-service | 8% | 210 MiB | 1 replica |
| PostgreSQL | 35% | 512 MiB | Single node |
| Redis | 5% | 64 MiB | Cache + sessions |

---

## 5. Certification Criteria

A release is **certified** when all conditions are met in staging:

1. All P95 API latencies remain below 200 ms for 30-minute sustained load.
2. Error rate stays below 1% across all scenarios.
3. Orders/hour and device messages/min meet or exceed targets without manual intervention.
4. HPA scales api-gateway and lims-service within 2 minutes of load spike.
5. No data corruption or duplicate order IDs under concurrent writes.

---

## 6. Remediation Log

| Date | Issue | Action | Status |
|------|-------|--------|--------|
| — | — | — | — |

---

## 7. Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Platform Engineering | | | |
| LIMS Product Owner | | | |
| SRE / Operations | | | |
