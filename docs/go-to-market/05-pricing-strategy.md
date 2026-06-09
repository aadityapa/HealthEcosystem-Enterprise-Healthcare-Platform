# 5. Pricing Strategy

Commercial model aligned to Indian diagnostic market segments. Plans are seeded in `commercial-service` and visible in partner-portal.

## Tier Overview

| Segment | Monthly (INR) | Annual (INR) | Setup Fee | Plan Code |
|---------|--------------|--------------|-----------|-----------|
| Small Lab | ₹15,000 – ₹40,000 | ₹1,50,000 – ₹4,00,000 | — | `SMALL_LAB` |
| Diagnostic Center | ₹50,000 – ₹2,00,000 | ₹5,00,000 – ₹20,00,000 | — | `DIAGNOSTIC_CENTER` |
| Multi-Branch Chain | ₹3,00,000 – ₹15,00,000 | ₹30,00,000 – ₹1,50,00,000 | — | `MULTI_BRANCH` |
| White Label Enterprise | Custom annual | ₹20,00,000+ / year | ₹20,00,000+ one-time | `WHITE_LABEL` |

## Plan Details

### Small Lab — `SMALL_LAB` (₹25,000/mo)

| Included | Limit |
|----------|-------|
| Branches | 1 |
| Users | 10 |
| Tests/month | 5,000 |
| Modules | LIMS, Billing, Patient Portal |
| Device integration | 2 instruments |
| Support | Email, 48h response |

**Upsell triggers:** > 5,000 tests/mo, second branch, EHR module

### Diagnostic Center — `DIAGNOSTIC_CENTER` (₹1,25,000/mo)

| Included | Limit |
|----------|-------|
| Branches | 3 |
| Users | 50 |
| Tests/month | 25,000 |
| Modules | LIMS, Billing, CRM, QC, Inventory, Patient Mobile |
| Device integration | 10 instruments |
| Support | Phone + email, 24h response |

### Multi-Branch Chain — `MULTI_BRANCH` (₹7,50,000/mo)

| Included | Limit |
|----------|-------|
| Branches | 25 |
| Users | 250 |
| Tests/month | Unlimited |
| Modules | Full platform (analytics, AI, field ops, marketplace) |
| Device integration | Unlimited |
| Support | Dedicated CSM, 4h response, quarterly business review |

### White Label Enterprise — `WHITE_LABEL`

| Item | Pricing |
|------|---------|
| Setup fee | ₹20,00,000 – ₹50,00,000 (branding, custom domain, data migration) |
| Annual license | ₹20,00,000 – ₹1,00,00,000 (based on branches + users) |
| Modules | Everything + white-label branding, custom workflows |
| Support | 24/7, named account team, on-site training |

## Add-Ons (All Tiers)

| Add-On | Monthly (INR) |
|--------|--------------|
| Additional branch | ₹5,000 – ₹15,000 |
| Additional 10 users | ₹3,000 – ₹8,000 |
| Radiology / PACS module | ₹25,000 – ₹75,000 |
| ABDM integration | ₹10,000 |
| AI analytics pack | ₹15,000 – ₹50,000 |
| Home collection (field ops) | ₹10,000 – ₹30,000 |
| Extra device connection | ₹2,000/instrument |

## Franchise / Partner Model

| Partner Type | Revenue Share | Minimum Commitment |
|-------------|---------------|-------------------|
| Franchise owner | 15–25% of branch MRR | 5 branches |
| Hospital reseller | 10–15% of contract value | 1 hospital |
| Diagnostic chain reseller | 8–12% of contract value | ₹10L ARR |
| Regional reseller | 15–20% of first-year ACV | 3 customers/year |

Track in `commercial-service` → Partner Accounts + Contracts.

## ROI Talking Points (for Sales Deck)

| Metric | Typical Improvement | Annual Savings (100-test/day lab) |
|--------|--------------------|------------------------------------|
| Reduced TAT | 30–40% faster report release | — |
| Reduced manual entry | 60–80% via device integration | ₹6–12L (2 FTE) |
| Increased throughput | 20–30% more tests same staff | ₹15–25L revenue |
| Reduced billing errors | 90% fewer manual billing mistakes | ₹2–5L |
| Reduced report re-prints | 95% digital delivery | ₹50K–1L |

## Quotation Workflow

1. Sales identifies segment → selects plan in partner-portal
2. `commercial-service` generates quotation (`/api/v1/commercial/quotations`)
3. Custom pricing for chains/white-label approved by commercial lead
4. Contract signed → `PartnerContract` created
5. Tenant provisioned → `TenantSubscription` activated

## Competitive Positioning

| vs Legacy LIMS | vs Spreadsheets | vs International SaaS |
|----------------|-----------------|----------------------|
| Modern UX | Structured workflows | India GST + ABDM native |
| Device integration built-in | Audit trail | INR pricing, local support |
| Multi-tenant SaaS | Real-time dashboards | NABL/CAP compliance packs |
