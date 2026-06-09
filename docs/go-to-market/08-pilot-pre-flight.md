# Pilot Pre-Flight Checklist

Run this **before any pilot customer** touches the platform.

## Verification Commands

```bash
docker compose up -d
pnpm db:seed

# Core
pnpm verify:health
pnpm verify:integration

# Enterprise risk areas (most likely to fail)
pnpm verify:tenant-isolation      # 1000+ cross-access tests
pnpm verify:billing-accuracy      # GST math + live invoice
pnpm verify:abdm-compliance       # FHIR, consent, ABHA
pnpm verify:device-import         # 5 vendor adapters
pnpm verify:dr-failover           # DR artifacts + drill checklist
pnpm verify:security              # Pre-VAPT internal checks
pnpm verify:workflow-engine       # Critical result workflow
pnpm verify:performance           # k6 smoke + certification targets

# End-to-end golden workflows
pnpm verify:golden-workflows
pnpm verify:golden-workflows --workflow diagnostic
pnpm verify:golden-workflows --workflow home-collection
pnpm verify:golden-workflows --workflow radiology

# Master scorecard (target 90%+)
pnpm verify:pilot
```

## Golden Workflows (100% Automated Target)

### Diagnostic

```
Patient Registration → Order → Billing → Sample Collection
→ Device Import → QC → Pathologist Verify → Report Release
→ WhatsApp → Patient Mobile
```

### Home Collection

```
Booking → Route → Phlebotomist Accept → GPS Verify
→ Collection → Lab Receipt → Report Delivery
```

### Radiology

```
Appointment → DICOM Study → Reporting → Verify → Release
```

## The Real Question

> Can 3–5 real diagnostic labs run daily operations for **90 consecutive days** without major workflow, clinical, security, or performance issues?

Everything in this folder exists to answer that question — not to add more modules.
