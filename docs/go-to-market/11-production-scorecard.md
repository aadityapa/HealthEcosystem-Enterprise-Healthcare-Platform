# Production Readiness Scorecard

## Weighted Areas

| Area | Weight | Automated Check | Manual Check |
|------|--------|-----------------|--------------|
| Functional Testing | 20% | `verify:health`, `verify:integration`, `verify:golden-workflows`, `verify:tenant-isolation`, `verify:billing-accuracy`, `verify:device-import`, `verify:workflow-engine` | E2E manual checklist |
| Security | 20% | `verify:security` | External VAPT report |
| Clinical Validation | 20% | `verify:golden-workflows` | Pathologist/radiologist sign-offs |
| Performance | 15% | `verify:performance` | Full k6 certification run |
| DR Testing | 10% | `verify:dr-failover` | DR drill executed |
| Compliance | 10% | `verify:abdm-compliance` | Compliance audit evidence |
| Documentation | 5% | Doc file presence | Sales assets complete |

## Targets

| Stage | Score | Action |
|-------|-------|--------|
| Internal QA | 70%+ | Fix integration gaps |
| NABL Pilot (5 sites) | 80%+ | Controlled pilot with feature freeze |
| Enterprise Sales | 90%+ | Paid onboarding allowed |
| National Scale | 95%+ | Multi-region production |

## Run Scorecard

```bash
pnpm verify:pilot
```

Example output:

```
  functional              85%    20%     17%
  security                72%    20%     14%
  clinical                 0%    20%      0%
  performance             60%    15%      9%
  dr                      45%    10%      5%
  compliance              80%    10%      8%
  documentation          100%     5%      5%
  ─────────────────────────────────────────────────
  TOTAL READINESS SCORE: 58%
```

Clinical and external VAPT are **manual gates** — they will score 0% until completed.
