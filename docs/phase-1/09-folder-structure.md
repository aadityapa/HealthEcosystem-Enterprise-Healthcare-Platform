# 09 — Monorepo Folder Structure

## 1. Top-Level Structure

```
health-ecosystem/
├── apps/                           # Frontend applications
│   ├── admin-portal/               # Next.js 15 — Admin & branch management
│   ├── doctor-portal/              # Next.js 15 — Doctor portal
│   ├── lab-workstation/            # Next.js 15 — Lab technician UI
│   ├── patient-app/                # Next.js 15 — Patient mobile web app
│   ├── franchise-dashboard/        # Next.js 15 — Franchise management
│   └── corporate-portal/           # Next.js 15 — Corporate client portal
│
├── services/                       # Backend microservices (NestJS)
│   ├── api-gateway/
│   ├── auth-service/
│   ├── tenant-service/
│   ├── patient-service/
│   ├── lims-service/
│   ├── device-service/
│   ├── ehr-service/
│   ├── pms-service/
│   ├── billing-service/
│   ├── collection-service/
│   ├── notification-service/
│   ├── report-service/
│   ├── ai-analytics-service/
│   ├── integration-service/
│   └── search-service/
│
├── packages/                       # Shared libraries
│   ├── ui/                         # Shadcn UI + Stitch design system
│   ├── types/                      # Shared TypeScript types & interfaces
│   ├── utils/                      # Shared utilities
│   ├── config/                     # ESLint, TSConfig, Tailwind presets
│   ├── auth-client/                # JWT/OAuth client library
│   ├── fhir/                       # FHIR R4 types & utilities
│   ├── hl7/                        # HL7 v2 parser/builder
│   ├── astm/                       # ASTM E1381/E1394 parser
│   └── events/                     # Event schemas & types (Kafka)
│
├── infrastructure/                 # IaC & DevOps
│   ├── terraform/
│   ├── kubernetes/
│   │   ├── base/
│   │   ├── overlays/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   └── helm/
│   ├── docker/
│   └── scripts/
│
├── docs/                           # Documentation
│   ├── phase-1/                    # Architecture (this phase)
│   ├── api/                        # API documentation
│   ├── runbooks/                   # Operational runbooks
│   └── compliance/                 # Compliance documentation
│
├── .github/
│   └── workflows/                  # CI/CD pipelines
│
├── docker-compose.yml
├── turbo.json                      # Turborepo config
├── package.json                    # Root workspace
├── pnpm-workspace.yaml
└── README.md
```

---

## 2. Frontend App Structure (Example: admin-portal)

```
apps/admin-portal/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── mfa/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Dashboard shell with sidebar
│   │   │   ├── page.tsx            # Dashboard home
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx        # Patient list
│   │   │   │   ├── [id]/page.tsx   # Patient detail
│   │   │   │   └── register/page.tsx
│   │   │   ├── lims/
│   │   │   │   ├── orders/
│   │   │   │   ├── samples/
│   │   │   │   ├── results/
│   │   │   │   ├── reports/
│   │   │   │   └── test-master/
│   │   │   ├── billing/
│   │   │   ├── devices/
│   │   │   ├── branches/
│   │   │   ├── users/
│   │   │   ├── franchise/
│   │   │   ├── analytics/
│   │   │   ├── audit-logs/
│   │   │   └── settings/
│   │   ├── api/                    # BFF routes (optional)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                     # Shadcn primitives (from packages/ui)
│   │   ├── layout/                 # Sidebar, header, breadcrumbs
│   │   ├── patients/               # Patient-specific components
│   │   ├── lims/                   # LIMS-specific components
│   │   ├── billing/                # Billing components
│   │   ├── charts/                 # Dashboard charts
│   │   └── shared/                 # Cross-module shared components
│   ├── hooks/                      # Custom React hooks
│   ├── lib/
│   │   ├── api/                    # API client (React Query)
│   │   ├── auth/                   # Auth context & guards
│   │   └── utils/
│   ├── stores/                     # Zustand stores
│   └── types/
├── public/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Backend Service Structure (Example: lims-service)

```
services/lims-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   └── configuration.ts
│   ├── common/
│   │   ├── decorators/             # @TenantId(), @BranchId(), @Permissions()
│   │   ├── guards/                 # TenantGuard, PermissionsGuard
│   │   ├── interceptors/           # AuditInterceptor, TransformInterceptor
│   │   ├── filters/                # GlobalExceptionFilter
│   │   └── pipes/                  # ValidationPipe
│   ├── modules/
│   │   ├── test-master/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── value-objects/
│   │   │   │   └── repositories/   # Interfaces
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   ├── queries/
│   │   │   │   └── handlers/
│   │   │   ├── infrastructure/
│   │   │   │   └── repositories/   # TypeORM implementations
│   │   │   ├── presentation/
│   │   │   │   ├── controllers/
│   │   │   │   └── dto/
│   │   │   └── test-master.module.ts
│   │   ├── orders/
│   │   ├── samples/
│   │   ├── results/
│   │   ├── reports/
│   │   └── routing/
│   ├── events/
│   │   ├── publishers/
│   │   └── handlers/
│   └── database/
│       ├── migrations/
│       └── seeds/
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── Dockerfile
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## 4. Shared Packages

### packages/ui (Design System)

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── data-table.tsx
│   │   ├── dialog.tsx
│   │   ├── form/
│   │   ├── sidebar.tsx
│   │   ├── status-badge.tsx
│   │   ├── skeleton-loader.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-state.tsx
│   │   └── ...
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── shadows.ts
│   ├── hooks/
│   │   └── use-theme.ts
│   └── index.ts
├── tailwind.preset.ts
└── package.json
```

### packages/types

```
packages/types/
├── src/
│   ├── patient.ts
│   ├── lims.ts
│   ├── billing.ts
│   ├── device.ts
│   ├── ehr.ts
│   ├── pms.ts
│   ├── auth.ts
│   ├── tenant.ts
│   ├── events.ts
│   ├── api.ts                    # Request/response types
│   └── index.ts
└── package.json
```

---

## 5. Device Service Structure

```
services/device-service/
├── src/
│   ├── modules/
│   │   ├── gateway/                # TCP/MLLP/Serial listeners
│   │   │   ├── astm.listener.ts
│   │   │   ├── hl7.listener.ts
│   │   │   └── connection.manager.ts
│   │   ├── engine/                 # Integration engine
│   │   │   ├── parser.factory.ts
│   │   │   ├── normalizer.ts
│   │   │   └── deduplicator.ts
│   │   ├── adapters/               # Vendor-specific adapters
│   │   │   ├── roche.adapter.ts
│   │   │   ├── abbott.adapter.ts
│   │   │   ├── siemens.adapter.ts
│   │   │   ├── sysmex.adapter.ts
│   │   │   ├── beckman.adapter.ts
│   │   │   └── adapter.registry.ts
│   │   ├── processor/              # Result processor
│   │   ├── validator/              # Validation engine
│   │   ├── monitor/                # Device monitoring
│   │   └── retry/                  # Retry queue manager
│   └── ...
```

---

## 6. Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `sample-result.entity.ts` |
| Classes | PascalCase | `SampleResultEntity` |
| Interfaces | PascalCase with I prefix | `ISampleRepository` |
| Enums | PascalCase | `SampleStatus` |
| DB tables | snake_case | `sample_results` |
| DB schemas | lowercase | `lims`, `patient` |
| API paths | kebab-case | `/api/v1/lab-orders` |
| Event names | dot.notation | `sample.status_changed` |
| Env vars | SCREAMING_SNAKE | `DATABASE_URL` |
| K8s resources | kebab-case | `lims-service` |
| Docker images | kebab-case | `healthplatform/lims-service` |

---

## 7. Turborepo Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

---

## 8. Approval Checklist

- [ ] Monorepo structure with Turborepo approved
- [ ] Frontend app separation (6 portals) approved
- [ ] Backend service structure (Clean Architecture) approved
- [ ] Shared packages scope approved
- [ ] Naming conventions approved
