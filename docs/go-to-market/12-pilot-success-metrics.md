# Pilot Success Metrics — First 5 Labs

Track weekly in `customer-success-service` SLA dashboard + spreadsheet.

## Operational Metrics

| Metric | Baseline (Week 0) | Target (Week 12) | Source |
|--------|-------------------|------------------|--------|
| Report TAT (order → release) | ___ min | -30% | analytics-service |
| Sample rejection % | ___% | < 2% | lims-service |
| Device import success % | ___% | > 99.5% | device-service |
| Billing accuracy % | ___% | > 99.5% | billing-service |
| QC failure rate | ___% | < 1% | qc-service |

## Business Metrics

| Metric | Week 4 | Week 8 | Week 12 |
|--------|--------|--------|---------|
| Revenue collected (₹) | | | |
| Outstanding amount (₹) | | | |
| Referral growth % | | | |
| Orders per day | | | |
| New patients per week | | | |

## Platform Metrics

| Metric | Target | Alert Threshold | Source |
|--------|--------|-----------------|--------|
| Uptime | 99.5% | < 99% | observability-service |
| API P95 latency | < 500ms (pilot) | > 1000ms | Grafana |
| Error rate | < 0.1% | > 1% | Jaeger |
| Support tickets (P1) | 0 open | > 0 for 4h | customer-success |
| Device offline events | < 5/day | > 20/day | device-service |

## Pilot Cohort

| # | Site | Type | Go-Live | Status |
|---|------|------|---------|--------|
| 1 | | Small Lab | | |
| 2 | | Small Lab | | |
| 3 | | Small Lab | | |
| 4 | | Regional Chain | | |
| 5 | | Hospital | | |

## Success Criteria (Day 90)

| Criteria | Target |
|----------|--------|
| Sites live without rollback | 5/5 |
| Critical bugs open | 0 |
| User NPS | > 40 |
| Pilot → paid conversion | 4/5 |
| Clinical incidents | 0 |

## Weekly Review

Use template in [04-nabl-pilot-program.md](./04-nabl-pilot-program.md).
