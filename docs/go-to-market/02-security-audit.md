# 2. Security Audit — External VAPT

**Do not rely on internal testing alone.** Healthcare buyers and NABL auditors expect third-party validation.

## Engagement Model

| Role | Responsibility |
|------|----------------|
| External Security Firm | Scope, coordinate, deliver final report |
| VAPT Team | Automated vulnerability scanning |
| Penetration Testing Team | Manual exploitation, social engineering (optional) |
| Internal SOC (security-service) | Remediation tracking, re-test coordination |

**Track engagements in:** `security-service` → Pentest module (`/api/v1/security/pentest`)

## Scope

### Application Layer

| Area | Tests | Priority |
|------|-------|----------|
| All REST APIs (35 services) | OWASP API Top 10 | P0 |
| Authentication | Brute force, credential stuffing, session fixation | P0 |
| JWT | Algorithm confusion, token replay, expiry bypass | P0 |
| MFA | Bypass, recovery code abuse | P0 |
| RBAC | Privilege escalation, horizontal access | P0 |
| File uploads (DMS) | MIME bypass, path traversal, XXE | P0 |
| Input validation | SQLi, NoSQLi, XSS, SSRF | P0 |
| Rate limiting | Gateway bypass, per-tenant limits | P1 |
| CORS | Origin spoofing | P1 |

### Infrastructure Layer

| Area | Tests | Priority |
|------|-------|----------|
| Kubernetes (EKS) | RBAC, pod security, secrets in env | P0 |
| Network policies | East-west traffic, namespace isolation | P0 |
| S3 / MinIO | Bucket policy, public access, presigned URL abuse | P0 |
| External Secrets | Secret exposure in logs, rotation gaps | P1 |
| Istio service mesh | mTLS bypass, sidecar injection gaps | P1 |
| ArgoCD | Git repo access, deployment tampering | P1 |
| Velero backups | Backup encryption, restore integrity | P2 |

### Healthcare-Specific

| Area | Tests |
|------|-------|
| PHI in logs/traces | Jaeger, Grafana, application logs |
| Audit log tampering | Immutable audit trail verification |
| Tenant data leakage | Cross-tenant API and DB access |
| ABDM consent artifacts | Unauthorized FHIR access |
| Device message injection | Malformed HL7/ASTM payloads |

## Deliverables

| Document | Owner | Storage |
|----------|-------|---------|
| VAPT Report | External firm | `compliance-service` evidence repo |
| Remediation Report | Internal engineering | security-service incidents |
| Re-test Report | External firm | compliance evidence |
| Executive Summary | Security lead | Sales deck (sanitized) |

## Severity SLA

| Severity | Remediation Target | Re-test |
|----------|-------------------|---------|
| Critical | 48 hours | Within 1 week |
| High | 2 weeks | Within 3 weeks |
| Medium | 30 days | Next audit cycle |
| Low | 90 days | Next audit cycle |
| Informational | Best effort | — |

## Pre-Audit Internal Checklist

Run before engaging external firm to avoid wasting budget on known issues:

```bash
pnpm verify:health
# Review security-service dashboard for open incidents
# Confirm JWT_SECRET, INTERNAL_SERVICE_KEY are not defaults in staging/prod
# Confirm MFA enabled for tenant_admin role
# Confirm S3 buckets are private
# Confirm Kubernetes secrets use External Secrets Operator
```

## Post-Audit

1. Log each finding as `SecurityIncident` or `VulnerabilityFinding`
2. Map to compliance controls (HIPAA, ISO 27001, SOC 2)
3. Upload remediation evidence to `compliance-service` evidence repo
4. Do not demo to enterprise buyers until **zero Critical/High open findings**
