# Phase 4 — Master Data Service & Billing Platform

## Overview

Phase 4 delivers the centralized **Master Data Service** and enterprise-grade **Billing Service** — the revenue engine of the HealthEcosystem platform.

## Services

| Service | Port | Tests |
|---------|------|-------|
| master-data-service | 3007 | 17 passing |
| billing-service | 3008 | 48 passing |

## Master Data Service

Central API for all shared reference data used across LIMS, Billing, EHR, PMS, Inventory, and Reporting.

### Managed Entities

| Entity | API Path |
|--------|----------|
| Test Categories & Tests | `/api/v1/master/tests` |
| Test Parameters & Pricing | `/api/v1/master/tests` |
| Package Masters | `/api/v1/master/packages` |
| Profile Masters | `/api/v1/master/profiles` |
| Rate Cards | `/api/v1/master/rate-cards` |
| Tax Masters (GST) | `/api/v1/master/tax` |
| Billing Codes | `/api/v1/master/billing-codes` |
| Specialties | `/api/v1/master/specialties` |
| Department Masters | `/api/v1/master/departments` |
| Device Catalog | `/api/v1/master/device-catalog` |
| States & Cities | `/api/v1/master/states`, `/api/v1/master/cities` |

### Features

- Redis cache (5-min TTL) for high-read master data
- `MASTER_DATA_UPDATED` domain events
- Indian states seed endpoint
- Multi-tenant with tenant/org/branch scoping

## Billing Service

Enterprise billing and revenue cycle management for diagnostic chains.

### Billing Types Supported

| Type | Description |
|------|-------------|
| LAB | Laboratory test billing |
| PACKAGE | Health package billing |
| PROFILE | Profile panel billing |
| HOME_COLLECTION | Home sample collection charges |
| URGENT | Urgent/stat processing surcharges |
| CORPORATE | Corporate client billing |
| INSURANCE | TPA/insurance claims |
| FRANCHISE | Franchise settlement billing |

### Modules

| Module | Features |
|--------|----------|
| **Invoices** | Create, issue, void; GST calculation; sequence numbering |
| **Payments** | Razorpay, Cashfree, PayU; UPI, cards, netbanking, wallets, cash, cheque |
| **Corporate** | Clients, contracts, credit limits, monthly statements |
| **Insurance** | TPA management, claims, tracking, reconciliation |
| **Franchise** | Revenue share, royalty, commission, branch settlement |
| **GST** | CGST/SGST/IGST, GSTR-1 export, GST reports |
| **Outstanding** | Balance tracking, aging reports |
| **Surcharges** | Home collection, urgent processing auto-charges |

### India GST Compliance

```
Intra-state: CGST (2.5%) + SGST (2.5%) = 5% on lab services
Inter-state: IGST (5%)
HSN/SAC: 999316 (Medical test services)
```

### Payment Gateway Integrations

| Provider | Methods | Webhook |
|----------|---------|---------|
| Razorpay | UPI, Cards, Netbanking, Wallets | `/api/v1/billing/payments/webhook/razorpay` |
| Cashfree | UPI, Cards, Netbanking | `/api/v1/billing/payments/webhook/cashfree` |
| PayU | UPI, Cards, Netbanking | `/api/v1/billing/payments/webhook/payu` |

### LIMS Integration

- Kafka consumer listens for `lims.order.created` → auto-creates LAB invoice
- Manual invoice creation with `referenceType=lab_order`
- Surcharges applied from `SurchargeRule` (home collection, urgent)

### Database Schema (billing)

18 tables: `invoices`, `invoice_lines`, `payments`, `payment_transactions`, `corporate_clients`, `corporate_contracts`, `credit_limits`, `insurance_tpas`, `insurance_claims`, `claim_lines`, `franchise_settlements`, `revenue_share_rules`, `gst_lines`, `monthly_statements`, `outstanding_balances`, `payment_gateway_configs`, `billing_sequences`, `surcharge_rules`

## UI Screens (web-admin)

### Master Data (9 pages)
- `/master/tests`, `/packages`, `/profiles`, `/rate-cards`, `/tax`, `/billing-codes`, `/specialties`, `/departments`, `/geography`

### Billing (11 pages)
- `/billing` (dashboard), `/invoices`, `/invoices/new`, `/invoices/[id]`, `/payments`, `/corporate`, `/corporate/statements`, `/insurance`, `/franchise`, `/gst`, `/outstanding`

## Platform Roadmap

| Phase | Module | Status |
|-------|--------|--------|
| 4 | Master Data + Billing | **Complete** |
| 5 | Inventory & Reagent Management | Planned |
| 6 | Quality Control (Levey-Jennings, Westgard) | Planned |
| 7 | CRM & B2B Sales | Planned |
| 8 | EHR + PMS | Planned |
| 9 | Patient Mobile App | Planned |
| 10 | ABDM + FHIR Integration | Planned |
