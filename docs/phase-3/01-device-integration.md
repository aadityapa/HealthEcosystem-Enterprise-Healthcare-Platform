# Phase 3 — Device Integration Platform

## Overview

The Device Integration Platform connects laboratory analyzers to the HealthEcosystem LIMS via a dedicated microservice at port **3006**.

## Architecture

```
┌─────────────┐   ┌──────────────┐   ┌───────────────────┐   ┌──────────────┐
│ Lab Device  │──▶│ Device       │──▶│ Protocol Handler  │──▶│ Integration  │
│ (Roche etc) │   │ Gateway      │   │ ASTM/HL7/FHIR/DICOM│   │ Engine       │
└─────────────┘   └──────────────┘   └───────────────────┘   └──────┬───────┘
                                                                    │
┌─────────────┐   ┌──────────────┐   ┌───────────────────┐         │
│ LIMS Service│◀──│ Result       │◀──│ Vendor Adapter    │◀────────┘
│ (port 3004) │   │ Processor    │   │ (5 vendors)       │
└─────────────┘   └──────────────┘   └───────────────────┘
       ▲                  │
       │           ┌──────┴───────┐
       │           │ Clinical     │
       │           │ Validation   │
       │           └──────────────┘
       │
┌──────┴───────┐   ┌──────────────┐   ┌───────────────────┐
│ Kafka Topics │   │ Redis Retry  │   │ Dead Letter Queue │
│ device.*     │   │ Queue        │   │ (Redis + PG)      │
└──────────────┘   └──────────────┘   └───────────────────┘
```

## Database Schema (device)

| Table | Purpose |
|-------|---------|
| `device.devices` | Device registry |
| `device.adapters` | Vendor field mapping |
| `device.connections` | TCP/MLLP/Serial config |
| `device.device_messages` | Raw instrument messages |
| `device.result_queue` | Pending result imports |
| `device.device_logs` | Device activity logs |
| `device.device_events` | State change events |
| `device.device_health` | Health metrics snapshots |
| `device.protocol_config` | Protocol-level settings |
| `device.device_certificates` | TLS/cert management |
| `device.dead_letter_queue` | Failed message storage |

## Supported Vendors

| Vendor | Adapter | Protocol | Example Models |
|--------|---------|----------|----------------|
| Roche | `roche.adapter.ts` | HL7 v2 MLLP | Cobas c501, c502, e801 |
| Abbott | `abbott.adapter.ts` | ASTM E1381 | Architect ci8200, Alinity |
| Siemens | `siemens.adapter.ts` | HL7 v2 | Atellica Solution |
| Sysmex | `sysmex.adapter.ts` | HL7 v2 | XN-1000, XN-9000 |
| Beckman Coulter | `beckman.adapter.ts` | ASTM E1381 | AU5800, DxH |

## Kafka Topics

| Topic | Event |
|-------|-------|
| `device.messages` | Raw message received |
| `device.results` | Result parsed and queued |
| `device.errors` | Parse/processing failures |
| `device.heartbeat` | Device health ping |

## API Endpoints

```
POST   /api/v1/devices                    Register device
GET    /api/v1/devices                    List devices
GET    /api/v1/devices/:id                Get device
PATCH  /api/v1/devices/:id                Update device
POST   /api/v1/devices/ingest/:deviceId   Ingest raw message
GET    /api/v1/devices/:id/health         Device health
GET    /api/v1/devices/messages           Message queue
GET    /api/v1/devices/messages/failed    DLQ messages
POST   /api/v1/devices/messages/:id/retry Retry failed message
GET    /api/v1/devices/adapters           List adapters
POST   /api/v1/devices/adapters           Create adapter config
GET    /api/v1/devices/health             Service health
```

## LIMS Integration

Result import calls LIMS internally:

```
POST {LIMS_SERVICE_URL}/api/v1/lims/samples/{sampleId}/results
Headers: x-tenant-id, x-organization-id, x-branch-id, x-user-id
Body: { results: [{ parameterId, value, unit, rawValue, deviceId }] }
```

Sample lookup by barcode via Prisma cross-schema query on `lims.samples`.

## Scalability

Target: **100,000 messages/minute**

- Redis sorted-set retry queue with exponential backoff
- Batch result processing
- Kafka partitioning by tenant_id
- Message deduplication via `messageControlId`
- Connection pooling for LIMS HTTP calls

## UI Screens (web-admin)

1. `/devices` — Device Dashboard
2. `/devices/register` — Device Registration
3. `/devices/monitoring` — Real-time Monitoring
4. `/devices/messages` — Message Queue Viewer
5. `/devices/messages/failed` — Failed Messages / DLQ
6. `/devices/health` — Device Health Metrics
7. `/devices/adapters` — Adapter Configuration
8. `/devices/protocols/astm` — ASTM Monitor
9. `/devices/protocols/hl7` — HL7 Monitor
10. `/devices/results` — Result Import Dashboard

## Tests

39 unit + integration tests covering:
- ASTM frame parsing (H/P/O/R/L records)
- HL7 MLLP parsing (ORU^R01, OBR, OBX segments)
- All 5 vendor adapters
- Integration engine (parse → normalize → dedup)
- Result processor (barcode match → LIMS call)
- Clinical validation (range, delta, panic)
- Retry queue operations
- Full ingestion pipeline integration test

## Next Phases

Per platform roadmap:
1. **Billing Service** — invoices, GST, payment gateway
2. **Inventory Management** — reagents, consumables
3. **Quality Control** — QC rules, Westgard plots
4. **EHR / PMS** — clinical modules
5. **Mobile applications** — patient app, doctor portal
