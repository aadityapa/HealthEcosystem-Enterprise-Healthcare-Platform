# Go-to-Market Readiness — Post Phase 30

The platform is **feature-complete**. The next phase is not more modules — it is **proving the system works end-to-end** under real clinical, security, and commercial conditions.

## Priority Order

| # | Initiative | Why First | Target |
|---|------------|-----------|--------|
| 1 | [Technical Due Diligence](./01-technical-due-diligence.md) | Feature-complete ≠ integration-complete | 100% functional verification |
| 2 | [Security Audit (External VAPT)](./02-security-audit.md) | Healthcare buyers require third-party proof | VAPT + remediation reports |
| 3 | [Clinical Validation](./03-clinical-validation.md) | Wrong results = liability | Pathologist/radiologist sign-off |
| 4 | [NABL Pilot Program](./04-nabl-pilot-program.md) | Real labs find what engineers miss | 3 small labs + 1 chain + 1 hospital |
| 5 | [Pricing Strategy](./05-pricing-strategy.md) | Revenue model before sales | Tiered INR pricing |
| 6 | [Sales Assets](./06-sales-assets.md) | Buyers need demos, not architecture docs | demo.yourdomain.com + deck |
| 7 | [Production Readiness](./07-production-readiness-checklist.md) | Gate before paid onboarding | All boxes checked |

## Automated Verification

```bash
# Core
pnpm verify:health
pnpm verify:integration

# Enterprise risk areas (run before any pilot)
pnpm verify:tenant-isolation
pnpm verify:billing-accuracy
pnpm verify:abdm-compliance
pnpm verify:device-import
pnpm verify:dr-failover
pnpm verify:security
pnpm verify:workflow-engine
pnpm verify:performance
pnpm verify:golden-workflows

# Master scorecard (target 90%+)
pnpm verify:pilot
```

See [08-pilot-pre-flight.md](./08-pilot-pre-flight.md) for the full checklist.

## Reality Check

| Risk | Mitigation |
|------|------------|
| Integration gaps | Run `verify:integration` weekly until 100% pass |
| Security audit failure | External VAPT before any enterprise demo |
| Clinical liability | Pathologist validation on 50+ real test panels |
| Pilot churn | Track bugs in customer-success tickets, not Slack |
| Pricing mismatch | Align commercial-service plans to market tiers |
| Demo environment drift | Separate `demo` namespace, reset nightly |

## Timeline (Suggested)

| Week | Focus |
|------|-------|
| 1–2 | Technical due diligence — fix all integration failures |
| 3–4 | External VAPT engagement + remediation sprint |
| 5–8 | Clinical validation with 2 pathologists + 1 radiologist |
| 9–16 | NABL pilot (5 sites) — freeze new features |
| 17–18 | Sales assets + demo environment |
| 19–20 | Production readiness gate → first paid customer |
