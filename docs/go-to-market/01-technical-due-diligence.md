# 1. Technical Due Diligence Audit

**Target:** 100% functional verification before any customer demo.

Many large systems are feature-complete but integration-incomplete. This audit proves every layer actually works together.

## Automated Baseline

```bash
docker compose up -d
pnpm db:seed
pnpm verify:health        # All service health endpoints
pnpm verify:integration   # Auth, tenant isolation, core workflows
pnpm test                 # 550+ unit tests
```

Exit code `0` on all four = baseline pass. Manual checklist below covers what automation cannot.

---

## A. Service Communication Matrix

| Service | Port | Health | Gateway Route | Inter-service Call | Status |
|---------|------|--------|---------------|-------------------|--------|
| api-gateway | 3000 | `/health` | — | Routes to all | ☐ |
| identity-service | 3001 | `/api/v1/auth/health` | `/api/v1/auth` | audit-service | ☐ |
| tenant-service | 3002 | `/api/v1/tenants/health` | `/api/v1/tenants` | identity | ☐ |
| patient-service | 3003 | `/api/v1/patients/health` | `/api/v1/patients` | audit | ☐ |
| lims-service | 3004 | `/api/v1/lims/health` | `/api/v1/lims` | device, billing | ☐ |
| audit-service | 3005 | `/api/v1/audit/health` | `/api/v1/audit` | — | ☐ |
| device-service | 3006 | `/api/v1/devices/health` | `/api/v1/devices` | lims | ☐ |
| master-data-service | 3007 | `/api/v1/master/health` | `/api/v1/master` | — | ☐ |
| billing-service | 3008 | `/api/v1/billing/health` | `/api/v1/billing` | lims | ☐ |
| inventory-service | 3009 | `/api/v1/inventory/health` | `/api/v1/inventory` | — | ☐ |
| qc-service | 3010 | `/api/v1/qc/health` | `/api/v1/qc` | lims | ☐ |
| crm-service | 3011 | `/api/v1/crm/health` | `/api/v1/crm` | — | ☐ |
| ehr-service | 3012 | `/api/v1/ehr/health` | `/api/v1/ehr` | patient | ☐ |
| abdm-service | 3013 | `/api/v1/abdm/health` | `/api/v1/abdm` | patient | ☐ |
| analytics-service | 3014 | `/api/v1/analytics/health` | `/api/v1/analytics` | ClickHouse | ☐ |
| ai-service | 3015 | `/api/v1/ai/health` | `/api/v1/ai` | — | ☐ |
| field-service | 3016 | `/api/v1/field/health` | `/api/v1/field` | lims | ☐ |
| radiology-service | 3017 | `/api/v1/radiology/health` | `/api/v1/radiology` | dms | ☐ |
| hrms-service | 3018 | `/api/v1/hrms/health` | `/api/v1/hrms` | — | ☐ |
| marketplace-service | 3019 | `/api/v1/marketplace/health` | `/api/v1/marketplace` | — | ☐ |
| observability-service | 3020 | `/api/v1/observability/health` | `/api/v1/observability` | Jaeger | ☐ |
| data-platform-service | 3021 | `/api/v1/data/health` | `/api/v1/data` | Kafka | ☐ |
| workflow-service | 3022 | `/api/v1/workflow/health` | `/api/v1/workflow` | lims | ☐ |
| dms-service | 3023 | `/api/v1/dms/health` | `/api/v1/dms` | MinIO/S3 | ☐ |
| branding-service | 3024 | `/api/v1/branding/health` | `/api/v1/branding` | — | ☐ |
| agents-service | 3025 | `/api/v1/agents/health` | `/api/v1/agents` | ai | ☐ |
| i18n-service | 3026 | `/api/v1/i18n/health` | `/api/v1/i18n` | — | ☐ |
| security-service | 3027 | `/api/v1/security/health` | `/api/v1/security` | — | ☐ |
| compliance-service | 3028 | `/api/v1/compliance/health` | `/api/v1/compliance` | — | ☐ |
| customer-success-service | 3029 | `/api/v1/customer-success/health` | `/api/v1/customer-success` | — | ☐ |
| commercial-service | 3030 | `/api/v1/commercial/health` | `/api/v1/commercial` | — | ☐ |

---

## B. End-to-End Workflow Verification

### B1. Patient → Order → Sample → Result → Report

| Step | API / Action | Expected | Status |
|------|-------------|----------|--------|
| 1 | Register patient | UHID generated | ☐ |
| 2 | Create lab order | Order number assigned | ☐ |
| 3 | Collect sample | Barcode printed, status = collected | ☐ |
| 4 | Process sample | Status transitions correct | ☐ |
| 5 | Enter/verify result | Reference range applied, flags set | ☐ |
| 6 | Approve result | Second sign-off recorded | ☐ |
| 7 | Release report | PDF generated, patient notified | ☐ |
| 8 | Audit trail | Every step logged in audit-service | ☐ |

### B2. Device Integration

| Step | Action | Expected | Status |
|------|--------|----------|--------|
| 1 | Register device (Sysmex/Roche) | Device appears in monitor | ☐ |
| 2 | Send ASTM/HL7 message | Parsed correctly | ☐ |
| 3 | Map to LIMS parameters | Values match instrument output | ☐ |
| 4 | Auto-import to sample | Results linked to barcode | ☐ |
| 5 | Failed message | Retry queue → DLQ after max retries | ☐ |
| 6 | Device offline | Alert generated, observability trace | ☐ |

### B3. Billing Accuracy

| Scenario | Input | Expected Total | Status |
|----------|-------|----------------|--------|
| Walk-in CBC | 1 test, no discount | Base price + GST | ☐ |
| Corporate panel | Package + corporate rate | Discounted price | ☐ |
| Interstate (IGST) | Branch in different state | IGST applied, not CGST+SGST | ☐ |
| Intra-state (CGST+SGST) | Same state | Split GST correct | ☐ |
| Payment + invoice void | Void after payment | Refund created | ☐ |
| Franchise settlement | Monthly rollup | Commission calculated | ☐ |

### B4. Kafka Event Flow

| Event | Producer | Consumer(s) | Verified | Status |
|-------|----------|-------------|----------|--------|
| `lims.order.created` | lims-service | analytics, data-platform | ☐ | ☐ |
| `lims.result.verified` | lims-service | workflow, audit | ☐ | ☐ |
| `device.result.imported` | device-service | lims, observability | ☐ | ☐ |
| `billing.invoice.created` | billing-service | analytics, audit | ☐ | ☐ |
| `billing.payment.received` | billing-service | crm | ☐ | ☐ |
| `security.threat.detected` | security-service | observability | ☐ | ☐ |

Verify via Kafka consumer lag = 0 and event visible in audit logs.

### B5. Multi-Tenant Isolation & RLS

| Test | Method | Expected | Status |
|------|--------|----------|--------|
| Tenant A cannot read Tenant B patients | JWT tenant A + patient B ID | 403/404 | ☐ |
| Tenant A cannot read Tenant B orders | Cross-tenant order ID | 403/404 | ☐ |
| Branch-scoped user sees only branch data | Branch-restricted role | Filtered results | ☐ |
| Direct DB query with wrong tenant context | Prisma without tenantId | RLS blocks or returns empty | ☐ |
| API without `x-tenant-id` | Missing header | 401/403 | ☐ |

Run: `pnpm verify:integration` (automated subset).

### B6. Workflow Engine

| Workflow | Trigger | Steps Complete | SLA Tracked | Status |
|----------|---------|----------------|-------------|--------|
| Critical result review | Critical flag on result | Pathologist → senior → notify | ☐ | ☐ |
| CAPA (QC failure) | Westgard violation | Investigation → action → close | ☐ | ☐ |
| Report approval | Result pending approval | Verifier → approver | ☐ | ☐ |

### B7. DR Failover

| Step | Action | Expected | Status |
|------|--------|----------|--------|
| 1 | Primary Postgres running | Replication lag < 1s | ☐ |
| 2 | Simulate primary failure | `docker-compose.dr.yml` failover | ☐ |
| 3 | Promote replica | Services reconnect | ☐ |
| 4 | Verify data integrity | Row counts match | ☐ |
| 5 | Backup restore | `infrastructure/scripts/backup-verify.sh` PASS | ☐ |
| 6 | RTO achieved | < 15 minutes | ☐ |
| 7 | RPO achieved | < 5 minutes data loss | ☐ |

---

## C. Sign-Off

| Role | Name | Date | Pass/Fail |
|------|------|------|-----------|
| Engineering Lead | | | |
| QA Lead | | | |
| DevOps Lead | | | |
| Product Owner | | | |

**Gate:** All ☐ checked + automated scripts pass → proceed to Security Audit.
