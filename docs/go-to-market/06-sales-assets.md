# 6. Sales Assets

Build these before the first enterprise sales meeting.

## Demo Environment

| Item | Specification |
|------|--------------|
| URL | `demo.yourdomain.com` |
| Infrastructure | EKS staging namespace, isolated from production |
| Data | Synthetic patients only (no real PHI) |
| Reset | Nightly `pnpm db:seed` via CronJob |
| Users | Pre-configured demo accounts (see below) |
| Uptime | 99.5% (business hours) |

### Demo Accounts

| Role | Email | Password | Shows |
|------|-------|----------|-------|
| Admin | demo-admin@demolab.health | Demo@123456 | Full platform |
| Lab Tech | demo-tech@demolab.health | Demo@123456 | Sample workflow |
| Front Desk | demo-desk@demolab.health | Demo@123456 | Patient + billing |
| Doctor | demo-doctor@demolab.health | Demo@123456 | EHR + results |
| Patient | demo-patient@demolab.health | Demo@123456 | Patient mobile app |
| Partner | demo-partner@demolab.health | Demo@123456 | Partner portal |

### Demo Flow (30 minutes)

1. **Patient registration** → UHID, ABHA link (2 min)
2. **Order + billing** → GST invoice, payment (3 min)
3. **Sample collection** → barcode, chain of custody (2 min)
4. **Device import** → live ASTM message → auto-result (5 min)
5. **Result verification** → critical value → workflow escalation (3 min)
6. **Report release** → PDF + patient mobile notification (2 min)
7. **Analytics dashboard** → TAT, revenue, throughput (3 min)
8. **Compliance dashboard** → HIPAA/NABL status (2 min)
9. **Partner portal** → quotation, subscription (3 min)
10. **Q&A** (5 min)

## Sales Deck Outline (15 slides)

| # | Slide | Content |
|---|-------|---------|
| 1 | Title | HealthEcosystem — Enterprise Healthcare SaaS |
| 2 | Problem | Fragmented lab systems, manual entry, compliance burden |
| 3 | Solution | Unified LIMS + EHR + Billing + Devices + ABDM |
| 4 | Product Overview | 35 microservices, 4 apps, 27 data domains |
| 5 | Architecture | Cloud-native, multi-tenant, event-driven (diagram) |
| 6 | LIMS Workflow | Order → sample → result → report (screenshot) |
| 7 | Device Integration | 5 vendor adapters, ASTM/HL7/FHIR (screenshot) |
| 8 | Billing & GST | Invoicing, payment gateways, franchise settlement |
| 9 | Compliance | HIPAA, NABL, CAP, ABDM, ISO 27001, SOC 2 |
| 10 | Security | SOC, WAF, encryption, audit trail, VAPT certified |
| 11 | AI & Analytics | Predictive TAT, revenue insights, AI agents |
| 12 | Mobile Apps | Patient app, phlebotomist app, partner portal |
| 13 | Marketplace | Reagent ordering, partner ecosystem |
| 14 | ROI | TAT reduction, manual work savings, throughput (calculator) |
| 15 | Pricing & Next Steps | Tier table, pilot offer, contact |

## ROI Calculator

| Input | Default | Formula |
|-------|---------|---------|
| Tests per day | 100 | — |
| Manual entry time per test | 3 min | — |
| Lab technician salary | ₹25,000/mo | — |
| Billing error rate (current) | 5% | — |
| Average test price | ₹500 | — |
| Device integration coverage | 0% → 70% | — |

| Output | Calculation |
|--------|-------------|
| Manual entry savings | tests × 3min × 70% × 22 days × salary/160h |
| Billing error savings | tests × price × error_rate × 90% × 22 days |
| Throughput revenue uplift | tests × 25% × price × 22 days |
| **Total annual savings** | Sum of above |
| **Platform cost** | Selected plan × 12 |
| **Net ROI** | Savings − cost |
| **Payback period** | Cost / (Savings / 12) months |

Build as spreadsheet or embed in partner-portal revenue page.

## One-Pagers (PDF)

| Document | Audience | Length |
|----------|----------|--------|
| Product Overview | CEO / Lab Owner | 2 pages |
| LIMS Deep Dive | Lab Manager / Pathologist | 3 pages |
| Security & Compliance | CISO / Quality Manager | 2 pages |
| Device Integration | Biomedical Engineer | 2 pages |
| ABDM Integration | Hospital IT | 1 page |
| Pricing Guide | Procurement | 1 page |

## Competitive Battle Cards

| Competitor Type | Our Advantage | Their Weakness |
|----------------|---------------|----------------|
| Legacy on-prem LIMS | Cloud SaaS, modern UX, device integration | Expensive maintenance, no mobile |
| Spreadsheet + manual | Audit trail, automation, compliance | No scalability, error-prone |
| International SaaS | India GST, ABDM, NABL, INR pricing | No local compliance, expensive |
| Hospital ERP module | Purpose-built LIMS, device layer | Generic, no pathology workflow |

## Asset Checklist

| Asset | Owner | Status |
|-------|-------|--------|
| Demo environment live | DevOps | ☐ |
| Sales deck (PPT/PDF) | Product Marketing | ☐ |
| Product overview one-pager | Product Marketing | ☐ |
| Security one-pager (post-VAPT) | Security Lead | ☐ |
| ROI calculator | Sales Ops | ☐ |
| Demo script + video recording | Sales | ☐ |
| Case study (post-pilot) | Customer Success | ☐ |
| Pricing page on website | Marketing | ☐ |
