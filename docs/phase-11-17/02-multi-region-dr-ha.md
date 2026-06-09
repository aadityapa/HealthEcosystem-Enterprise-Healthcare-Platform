# Phase 17 — Multi-Region DR & High Availability

## Target Architecture

```
                    ┌─────────────────────────────────────┐
                    │         Global DNS / CDN            │
                    │    (Route53 / Cloudflare)           │
                    └──────────────┬──────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
    ┌─────────▼─────────┐  ┌──────▼──────┐  ┌─────────▼─────────┐
    │  Mumbai (Primary)  │  │  Read       │  │ Hyderabad (DR)    │
    │  ap-south-1        │  │  Replicas   │  │  ap-south-2       │
    └─────────┬─────────┘  └─────────────┘  └─────────┬─────────┘
              │                                        │
    ┌─────────▼────────────────────────────────────────▼─────────┐
    │  PostgreSQL Primary ←── streaming replication ──→ Standby  │
    │  Redis Cluster (3 nodes)          Redis Replica            │
    │  ClickHouse (primary)             ClickHouse (replica)     │
    │  Kafka (3 brokers)                Kafka MirrorMaker 2      │
    └────────────────────────────────────────────────────────────┘
```

## Region Configuration

| Region | Role | AWS Region | RTO | RPO |
|--------|------|------------|-----|-----|
| Mumbai | Primary | ap-south-1 | — | — |
| Hyderabad | DR | ap-south-2 | 15 min | 5 min |

Environment variables per region:

```bash
DEPLOYMENT_REGION=ap-south-1          # or ap-south-2
DEPLOYMENT_ROLE=primary               # or dr-standby
DATABASE_REPLICA_URL=postgresql://... # read replica connection
```

## Components

### 1. Cross-Region PostgreSQL Replication

Primary (Mumbai) streams WAL to DR standby (Hyderabad).

```sql
-- Primary: create replication user
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD '...';
-- pg_hba.conf: host replication replicator <dr-ip>/32 scram-sha-256
```

Read replicas serve analytics queries and reporting workloads.

Config: `infrastructure/postgres/replication.conf`

### 2. Redis Sentinel

3-node Redis Sentinel cluster with automatic failover.
- Primary in Mumbai
- Replica in Hyderabad
- Quorum: 2

### 3. ClickHouse Replication

ClickHouse ReplicatedMergeTree tables with ZooKeeper coordination.
- Primary shard in Mumbai
- Replica shard in Hyderabad for analytics DR

### 4. Kafka MirrorMaker 2

Cross-region topic replication for critical events:
- `lims.order.created`
- `billing.payment.received`
- `patient.registered`

### 5. Automated Failover

Kubernetes-based failover using:
- `infrastructure/kubernetes/overlays/mumbai/` — primary overlay
- `infrastructure/kubernetes/overlays/hyderabad/` — DR overlay
- External DNS health checks trigger failover

Failover sequence:
1. Health check detects primary region failure (3 consecutive failures)
2. Promote PostgreSQL standby to primary
3. Update Route53 weighted routing (DR weight → 100)
4. Scale up DR Kubernetes cluster
5. Notify ops via PagerDuty/Slack

### 6. Backup Verification

Nightly automated backup verification:
- PostgreSQL: `pg_dump` → S3 → restore to ephemeral instance → row count validation
- ClickHouse: snapshot → restore test
- Schedule: `infrastructure/scripts/backup-verify.sh`

### 7. Chaos Testing

Chaos engineering schedule (monthly):

| Test | Tool | Target |
|------|------|--------|
| Pod kill | Chaos Mesh | Random microservice pod |
| Network partition | Chaos Mesh | Inter-service communication |
| DB failover | Litmus | PostgreSQL primary failure |
| Region isolation | Manual | Full Mumbai region blackout simulation |

Runbook: `infrastructure/runbooks/dr-failover.md`

## Kubernetes Manifests

```
infrastructure/kubernetes/
├── base/                    # Base deployments (all services)
├── overlays/
│   ├── mumbai/              # Primary region patches
│   └── hyderabad/           # DR region patches
├── monitoring/
│   ├── prometheus.yml
│   └── grafana-dashboards/
└── ingress/
    ├── mumbai-ingress.yaml
    └── hyderabad-ingress.yaml
```

## Docker Compose DR Profile

For local DR simulation:

```bash
docker compose -f docker-compose.yml -f infrastructure/docker/docker-compose.dr.yml up
```

The DR profile starts a second PostgreSQL instance configured as streaming replica.

## SLA Targets

| Metric | Target |
|--------|--------|
| Availability | 99.95% |
| RTO | 15 minutes |
| RPO | 5 minutes |
| Backup retention | 30 days (daily), 12 months (monthly) |
| DR drill frequency | Quarterly |

## Deployment Checklist

- [ ] PostgreSQL streaming replication configured and lag < 1s
- [ ] Redis Sentinel quorum operational
- [ ] ClickHouse replica syncing
- [ ] Kafka MirrorMaker 2 lag < 10s
- [ ] DNS failover tested
- [ ] Backup restore verified (last 7 days)
- [ ] Chaos test passed (last 30 days)
- [ ] Runbook reviewed and on-call trained
