# 7. Production Readiness Checklist

**Gate before onboarding paying customers.** Every item must be checked.

## Infrastructure

| # | Item | Owner | Verification | Status |
|---|------|-------|-------------|--------|
| 1 | EKS production cluster deployed | DevOps | `kubectl get nodes` healthy | ☐ |
| 2 | ArgoCD syncing all services | DevOps | All apps `Synced/Healthy` | ☐ |
| 3 | Istio mTLS enabled | DevOps | `istioctl authn tls-check` | ☐ |
| 4 | Karpenter auto-scaling | DevOps | Scale test → nodes added | ☐ |
| 5 | External Secrets Operator | DevOps | No secrets in ConfigMaps | ☐ |
| 6 | Velero daily backups | DevOps | Backup schedule active | ☐ |
| 7 | Crossplane infra provisioning | DevOps | RDS/S3 via CRDs | ☐ |
| 8 | DNS + TLS (cert-manager) | DevOps | `demo.yourdomain.com` valid cert | ☐ |
| 9 | CDN / WAF (CloudFront + AWS WAF) | DevOps | WAF rules active | ☐ |
| 10 | Network policies enforced | DevOps | Deny-all default, allow-list | ☐ |

## Data & DR

| # | Item | Owner | Verification | Status |
|---|------|-------|-------------|--------|
| 11 | Postgres primary + replica | DevOps | Replication lag < 1s | ☐ |
| 12 | Backup validation | DevOps | `backup-verify.sh` PASS | ☐ |
| 13 | DR drill completed | DevOps | Failover < 15 min RTO | ☐ |
| 14 | Redis cluster (sentinel/cluster) | DevOps | Failover test PASS | ☐ |
| 15 | Kafka cluster (3 brokers) | DevOps | No under-replicated partitions | ☐ |
| 16 | S3 versioning + encryption | DevOps | AES-256, versioning on | ☐ |
| 17 | ClickHouse backup | DevOps | Daily snapshot | ☐ |

## Performance & Security

| # | Item | Owner | Verification | Status |
|---|------|-------|-------------|--------|
| 18 | Load test certification | QA | k6 targets met (see phase-26 doc) | ☐ |
| 19 | External VAPT complete | Security | Zero Critical/High open | ☐ |
| 20 | Compliance audit complete | Compliance | HIPAA + NABL controls ≥ 90% | ☐ |
| 21 | Clinical validation signed | Clinical | Pathologist sign-off | ☐ |
| 22 | Technical due diligence 100% | Engineering | All workflows verified | ☐ |
| 23 | Pen test remediation | Security | Re-test PASS | ☐ |

## Observability & Operations

| # | Item | Owner | Verification | Status |
|---|------|-------|-------------|--------|
| 24 | Grafana dashboards (per service) | SRE | 35 service dashboards | ☐ |
| 25 | Jaeger tracing end-to-end | SRE | Trace visible order→report | ☐ |
| 26 | PagerDuty / on-call rotation | SRE | Rotation configured | ☐ |
| 27 | Incident response runbooks | SRE | 10 runbooks documented | ☐ |
| 28 | On-call procedures | SRE | Escalation matrix defined | ☐ |
| 29 | SLA monitoring active | SRE | observability-service alerts | ☐ |
| 30 | Log aggregation (no PHI in logs) | SRE | Scrubbing rules active | ☐ |

## Application

| # | Item | Owner | Verification | Status |
|---|------|-------|-------------|--------|
| 31 | Multi-tenant isolation verified | Engineering | `verify:integration` PASS | ☐ |
| 32 | RLS policies active | Engineering | Cross-tenant query blocked | ☐ |
| 33 | MFA enforced for admins | Security | tenant_admin requires MFA | ☐ |
| 34 | Rate limiting configured | Engineering | Gateway 120 req/min | ☐ |
| 35 | CORS locked to known origins | Engineering | No wildcard in prod | ☐ |
| 36 | JWT secret rotated | Security | Not default value | ☐ |
| 37 | Demo environment isolated | DevOps | Separate namespace/DB | ☐ |

## Commercial & Support

| # | Item | Owner | Verification | Status |
|---|------|-------|-------------|--------|
| 38 | Pricing plans live | Commercial | 4 tiers in commercial-service | ☐ |
| 39 | Partner portal live | Commercial | partner-portal :3130 | ☐ |
| 40 | Customer onboarding playbook | CS | Onboarding checklist ready | ☐ |
| 41 | Support ticketing SLA defined | CS | P1: 4h, P2: 24h, P3: 72h | ☐ |
| 42 | Knowledge base populated | CS | ≥ 20 articles | ☐ |
| 43 | Training courses published | CS | LIMS-101 + role courses | ☐ |
| 44 | NABL pilot complete (4/5 converted) | CS | Pilot success criteria met | ☐ |

## Incident Response Runbooks (Required)

| Runbook | Trigger | Owner |
|---------|---------|-------|
| Service down | Health check failure > 2 min | SRE |
| Database failover | Primary unreachable | DevOps |
| Kafka lag spike | Consumer lag > 10,000 | Engineering |
| Security incident | SIEM critical alert | Security |
| Data breach | Unauthorized PHI access | Security + Legal |
| Certificate expiry | < 14 days to expiry | DevOps |
| Payment gateway failure | Webhook errors > 5% | Engineering |
| Device message storm | > 10,000 msg/min | Engineering |
| Disk full | Storage > 85% | DevOps |
| DDoS attack | WAF alert + traffic spike | Security |

## Go/No-Go Decision

| Criteria | Required |
|----------|----------|
| All Infrastructure items (1–10) | 100% |
| All Data & DR items (11–17) | 100% |
| Performance & Security (18–23) | 100% |
| Observability (24–30) | ≥ 90% |
| Application (31–37) | 100% |
| Commercial & Support (38–44) | ≥ 85% |

**Sign-off required from:** CEO, CTO, CISO, Head of Clinical, Head of Customer Success

| Role | Name | Date | Go / No-Go |
|------|------|------|------------|
| CEO | | | |
| CTO | | | |
| CISO | | | |
| Clinical Lead | | | |
| CS Lead | | | |
