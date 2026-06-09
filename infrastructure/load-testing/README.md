# HealthEcosystem Load Testing (Phase 26)

k6 scripts and a Gatling simulation stub for performance certification of the API gateway, LIMS throughput, and device message ingestion.

## Prerequisites

- [k6](https://k6.io/docs/get-started/installation/) installed locally
- HealthEcosystem stack running (`docker compose up` or deployed environment)
- Seeded demo tenant (`demo-lab`, `admin@demolab.com` / `Admin@123456`)

## Quick Start

```bash
cd infrastructure/load-testing

# Smoke test — gateway health, auth, patients, orders
k6 run scripts/load/api-gateway.js

# LIMS throughput (defaults to 50k orders/hour; scale down for local)
ORDERS_PER_HOUR=3600 k6 run scripts/load/lims-throughput.js

# Device message ingest (defaults to 100k msg/min; scale down for local)
MESSAGES_PER_MIN=600 k6 run scripts/load/device-messages.js
```

Or via npm scripts:

```bash
npm run load:gateway:local
npm run load:lims:local
npm run load:devices:local
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3000` | API gateway base URL |
| `LOAD_TEST_EMAIL` | `admin@demolab.com` | Login email |
| `LOAD_TEST_PASSWORD` | `Admin@123456` | Login password |
| `TENANT_SLUG` | `demo-lab` | Tenant slug |
| `ORDERS_PER_HOUR` | `50000` | LIMS order arrival rate target |
| `MESSAGES_PER_MIN` | `100000` | Device ingest arrival rate target |
| `DURATION` | `5m` / `3m` | Scenario duration |
| `DEVICE_ID` | _(auto-discovered)_ | Target device UUID |
| `PATIENT_ID` | _(auto-created)_ | Patient UUID for order tests |
| `TEST_ID` | _(auto-discovered)_ | LIMS test UUID for order items |

## Gatling Stub

```bash
# Requires sbt + Gatling plugin (not bundled in this repo)
sbt "Gatling/testOnly simulations.HealthEcosystemSimulation"
```

## Performance Targets

See [Performance Certification Report](../../docs/phase-25-30/02-performance-certification.md) for certification targets and results template.
