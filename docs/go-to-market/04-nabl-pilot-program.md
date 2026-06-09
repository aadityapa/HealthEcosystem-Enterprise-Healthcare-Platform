# 4. NABL Pilot Program

**This phase is worth more than adding 10 new modules.**

Real labs surface workflow gaps, UX friction, and missing features that no amount of internal testing will find.

## Pilot Cohort

| # | Site Type | Target Profile | Branches | Users | Go-Live |
|---|-----------|---------------|----------|-------|---------|
| 1 | Small Lab | 50–200 tests/day, single location | 1 | 5–10 | Week 9 |
| 2 | Small Lab | Specialty (histopath) | 1 | 8–12 | Week 9 |
| 3 | Small Lab | High device volume | 1 | 10–15 | Week 10 |
| 4 | Regional Chain | 5–15 branches | 5–15 | 50–100 | Week 11 |
| 5 | Hospital Lab | IP + OP, radiology | 1 hospital | 30–50 | Week 12 |

**Total:** 3 small labs + 1 regional chain + 1 hospital

## Pilot Terms

| Item | Terms |
|------|-------|
| Duration | 90 days |
| Pricing | Free or 50% discount (document in commercial-service) |
| Support | Dedicated CSM + Slack/WhatsApp channel |
| SLA | Best-effort (not production SLA) |
| Data | Pilot data isolated tenant, exportable on exit |
| Exit | Full data export + migration support |

## Onboarding Per Site

Track in `customer-success-service` → Tenant Onboarding:

```
☐ Tenant provisioned (unique subdomain)
☐ Master data configured (test catalog, panels, prices)
☐ Users + roles created
☐ Devices connected (if applicable)
☐ Billing + GST configured
☐ Staff training completed (LIMS-101 + role-specific)
☐ Parallel run (1 week — old system + HealthEcosystem)
☐ Cutover go-live
☐ Hypercare (2 weeks post go-live)
```

## What to Track

| Category | Tool | Metric |
|----------|------|--------|
| Bugs | support-service tickets | Count, severity, resolution time |
| Missing features | tickets tagged `feature-request` | Priority-ranked backlog |
| Workflow problems | CSM notes + onboarding checklist | Steps blocked |
| UX issues | User interviews (weekly) | SUS score target > 70 |
| Performance | observability-service | P95 latency, error rate |
| Clinical issues | QC failures, result disputes | Zero tolerance |

## Weekly Pilot Review Template

```markdown
## Week N — Pilot Review

### Sites Active: X/5
### New Bugs: X (Critical: X, High: X)
### Bugs Resolved: X
### Feature Requests: X (accepted: X, deferred: X)
### Workflow Blockers: [list]
### Training Completion: X%
### Tests Processed: X
### Incidents: X

### Top 3 Actions This Week:
1.
2.
3.

### Go/No-Go for Next Site:
```

## Success Criteria (End of 90 Days)

| Metric | Target |
|--------|--------|
| Sites live without rollback | 5/5 |
| Critical bugs open | 0 |
| High bugs open | < 3 |
| User satisfaction (NPS) | > 40 |
| Order-to-report TAT improvement | > 20% vs baseline |
| Billing error rate | < 0.5% |
| Device import accuracy | > 99.5% |
| Pilot → paid conversion intent | 4/5 sites |

## Feature Freeze Rule

During pilot (Weeks 9–16):

- **No new modules**
- **Only:** bug fixes, workflow fixes, UX improvements from pilot feedback
- **Exception:** regulatory blocker (NABL/ABDM mandate)

## Pilot → Production Transition

1. Security audit complete (zero Critical/High)
2. Clinical validation signed off
3. Load test certification passed
4. Pilot site converts to paid subscription (commercial-service)
5. Production SLA activated (observability-service)
