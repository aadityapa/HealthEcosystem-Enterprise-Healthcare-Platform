import {
  BarChart,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
  CollapsibleSection,
  Grid,
  H1,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  TodoListCard,
  UsageBar,
} from "cursor/canvas";

type ServiceRow = { service: string; port: string; domain: string; phase: string };

const APPS = [
  { app: "web-admin", port: "3100", users: "Lab admins, pathologists, billing, ops", pages: "150+" },
  { app: "patient-mobile", port: "3110", users: "Patients — reports, booking, payments", pages: "40+" },
  { app: "phlebotomist-app", port: "3120", users: "Field collection, GPS, routes", pages: "25+" },
  { app: "partner-portal", port: "3130", users: "Franchise, hospitals, resellers, sales", pages: "15+" },
];

const PRISMA_SCHEMAS = [
  "core", "master", "patient", "lims", "audit", "device", "billing", "inventory",
  "qc", "crm", "ehr", "abdm", "analytics", "ai", "field", "radiology", "hrms",
  "marketplace", "observability", "data", "workflow", "dms", "branding", "agents",
  "i18n", "security", "compliance", "customer_success", "commercial",
];

const CORE_SERVICES: ServiceRow[] = [
  { service: "api-gateway", port: "3000", domain: "JWT auth, rate limit, routing, CORS", phase: "2" },
  { service: "identity-service", port: "3001", domain: "Auth, MFA, JWT, sessions, users", phase: "2" },
  { service: "tenant-service", port: "3002", domain: "Tenants, orgs, branches, franchise", phase: "2" },
  { service: "patient-service", port: "3003", domain: "UHID, family, consent, timeline", phase: "2" },
  { service: "audit-service", port: "3005", domain: "Immutable audit trail, compliance logs", phase: "2" },
];

const LIMS_SERVICES: ServiceRow[] = [
  { service: "lims-service", port: "3004", domain: "Orders, samples, results, reports, TAT", phase: "2-3" },
  { service: "device-service", port: "3006", domain: "ASTM/HL7/FHIR/DICOM, 5 vendor adapters", phase: "3" },
  { service: "master-data-service", port: "3007", domain: "Test catalog, panels, pricing, GST", phase: "4" },
  { service: "billing-service", port: "3008", domain: "Invoices, GST, Razorpay/Cashfree/PayU", phase: "4" },
  { service: "inventory-service", port: "3009", domain: "Reagents, PO, stock transfer, expiry", phase: "5" },
  { service: "qc-service", port: "3010", domain: "Westgard rules, CAPA, calibration", phase: "6" },
];

const CLINICAL_SERVICES: ServiceRow[] = [
  { service: "crm-service", port: "3011", domain: "Referrals, camps, B2B sales, leads", phase: "7" },
  { service: "ehr-service", port: "3012", domain: "Appointments, consults, prescriptions", phase: "8" },
  { service: "abdm-service", port: "3013", domain: "ABHA, consent, FHIR R4, HIP/HIU", phase: "10" },
  { service: "radiology-service", port: "3017", domain: "PACS/RIS, DICOM, study workflow", phase: "14" },
  { service: "field-service", port: "3016", domain: "Home collection routes, GPS, phlebotomist", phase: "13" },
];

const ENTERPRISE_SERVICES: ServiceRow[] = [
  { service: "analytics-service", port: "3014", domain: "ClickHouse, Superset, executive BI", phase: "11" },
  { service: "ai-service", port: "3015", domain: "Clinical + operational ML inference", phase: "12" },
  { service: "hrms-service", port: "3018", domain: "Employees, payroll, attendance", phase: "15" },
  { service: "marketplace-service", port: "3019", domain: "Reagent marketplace, partner orders", phase: "16" },
  { service: "observability-service", port: "3020", domain: "OTel, Jaeger, Grafana, SLA", phase: "18" },
  { service: "data-platform-service", port: "3021", domain: "Data lake, pipelines, warehouse", phase: "19" },
  { service: "workflow-service", port: "3022", domain: "BPMN engine, critical result flow", phase: "20" },
  { service: "dms-service", port: "3023", domain: "Documents, OCR, e-sign, retention", phase: "21" },
  { service: "branding-service", port: "3024", domain: "White-label, custom domain, features", phase: "22" },
  { service: "agents-service", port: "3025", domain: "AI agents — patient, doctor, lab, ops", phase: "23" },
  { service: "i18n-service", port: "3026", domain: "Locales, currency, translations", phase: "24" },
];

const LAUNCH_SERVICES: ServiceRow[] = [
  { service: "security-service", port: "3027", domain: "SOC, SIEM, WAF, certs, pentest", phase: "25" },
  { service: "compliance-service", port: "3028", domain: "8 frameworks, evidence, risk register", phase: "28" },
  { service: "customer-success-service", port: "3029", domain: "Onboarding, migration, SLA, tickets", phase: "29" },
  { service: "commercial-service", port: "3030", domain: "Plans, licensing, quotes, revenue", phase: "30" },
];

const PHASES = [
  { range: "1", title: "Architecture", modules: "10 design docs, ER, DDL, RBAC, K8s plan", status: "Complete" },
  { range: "2", title: "Core Platform", modules: "Auth, tenant, patient, LIMS core", status: "Complete" },
  { range: "3", title: "Device Integration", modules: "ASTM, HL7, 5 vendors, auto-import", status: "Complete" },
  { range: "4", title: "Master Data & Billing", modules: "Catalog, GST, payment gateways", status: "Complete" },
  { range: "5-10", title: "Platform Expansion", modules: "Inventory, QC, CRM, EHR, mobile, ABDM", status: "Complete" },
  { range: "11-17", title: "Enterprise Platform", modules: "Analytics, AI, field, PACS, HRMS, DR", status: "Complete" },
  { range: "18-24", title: "Enterprise Completion", modules: "Observability, lake, workflow, DMS, i18n", status: "Complete" },
  { range: "25-30", title: "Commercial Launch", modules: "SOC, K8s, compliance, CS, partner portal", status: "Complete" },
  { range: "GTM", title: "Go-to-Market", modules: "Verification, pilot, VAPT, clinical sign-off", status: "In Progress" },
];

const COMPLIANCE = [
  { framework: "HIPAA", scope: "US healthcare PHI safeguards" },
  { framework: "GDPR", scope: "EU data subject rights" },
  { framework: "DPDP", scope: "India Digital Personal Data Protection" },
  { framework: "ISO 27001", scope: "Information security management" },
  { framework: "SOC 2 Type II", scope: "Trust services criteria" },
  { framework: "NABL", scope: "Lab accreditation (India)" },
  { framework: "CAP", scope: "College of American Pathologists" },
  { framework: "ABDM", scope: "India national health stack" },
];

const PRICING = [
  { tier: "Small Lab", code: "SMALL_LAB", monthly: "₹25,000", branches: "1", users: "10" },
  { tier: "Diagnostic Center", code: "DIAGNOSTIC_CENTER", monthly: "₹1,25,000", branches: "3", users: "50" },
  { tier: "Multi-Branch Chain", code: "MULTI_BRANCH", monthly: "₹7,50,000", branches: "25", users: "250" },
  { tier: "White Label Enterprise", code: "WHITE_LABEL", monthly: "₹20L+/yr", branches: "100", users: "1000" },
];

const SCALE_TARGETS = [
  { metric: "Concurrent users", target: "50,000+", tool: "k6 load test" },
  { metric: "Orders / hour", target: "50,000+", tool: "k6 lims-throughput" },
  { metric: "Device msgs / min", target: "100,000+", tool: "k6 device-messages" },
  { metric: "Reports / min", target: "10,000+", tool: "Gatling simulation" },
  { metric: "API P95 latency", target: "< 200ms", tool: "Grafana + k6" },
];

const K8S_STACK = [
  { component: "EKS", role: "Production Kubernetes cluster" },
  { component: "ArgoCD", role: "GitOps continuous delivery" },
  { component: "Istio", role: "Service mesh, mTLS, canary releases" },
  { component: "Karpenter", role: "Node auto-scaling" },
  { component: "External Secrets", role: "Vault/AWS secrets injection" },
  { component: "Velero", role: "Cluster backup and restore" },
  { component: "Crossplane", role: "Infrastructure as code (RDS, S3)" },
];

const GOLDEN_WORKFLOWS = [
  { name: "Diagnostic", steps: "Register → Order → Bill → Collect → Device Import → QC → Verify → Release → WhatsApp → Mobile" },
  { name: "Home Collection", steps: "Book → Route → Phlebotomist Accept → GPS → Collect → Lab Receipt → Report" },
  { name: "Radiology", steps: "Appointment → DICOM Study → PACS → Report → Verify → Release" },
];

const VERIFY_COMMANDS = [
  { cmd: "pnpm verify:pilot", purpose: "Production readiness scorecard (90%+ target)" },
  { cmd: "pnpm verify:tenant-isolation", purpose: "1000+ multi-tenant cross-access tests" },
  { cmd: "pnpm verify:golden-workflows", purpose: "E2E diagnostic / home / radiology" },
  { cmd: "pnpm verify:billing-accuracy", purpose: "GST CGST/SGST/IGST validation" },
  { cmd: "pnpm verify:device-import", purpose: "5 vendor adapter certification" },
  { cmd: "pnpm verify:security", purpose: "Pre-VAPT internal checks" },
  { cmd: "pnpm verify:performance", purpose: "k6 smoke + certification targets" },
  { cmd: "pnpm verify:dr-failover", purpose: "DR artifacts + drill checklist" },
];

const PILOT_TODOS = [
  { id: "1", content: "Technical due diligence — 100% workflow verification", status: "in_progress" as const },
  { id: "2", content: "External VAPT — zero Critical/High findings", status: "pending" as const },
  { id: "3", content: "Clinical sign-off — pathologist + radiologist certificates", status: "pending" as const },
  { id: "4", content: "Device live certification — Roche, Abbott, Siemens, Sysmex, Beckman", status: "pending" as const },
  { id: "5", content: "NABL pilot — 3 small labs + 1 chain + 1 hospital (90 days)", status: "pending" as const },
  { id: "6", content: "Production readiness scorecard ≥ 90%", status: "pending" as const },
  { id: "7", content: "Demo environment — demo.yourdomain.com", status: "pending" as const },
  { id: "8", content: "First paid customer onboarding", status: "pending" as const },
];

const DEVICE_VENDORS = [
  { vendor: "Roche", protocol: "HL7 v2", model: "Cobas c501", parser: "Complete", live: "Pending" },
  { vendor: "Abbott", protocol: "HL7 v2", model: "Architect i2000", parser: "Complete", live: "Pending" },
  { vendor: "Siemens", protocol: "HL7 v2", model: "Atellica", parser: "Complete", live: "Pending" },
  { vendor: "Sysmex", protocol: "HL7 v2", model: "XN-1000", parser: "Complete", live: "Pending" },
  { vendor: "Beckman", protocol: "ASTM", model: "AU5800", parser: "Complete", live: "Pending" },
];

const INFRA = [
  { service: "PostgreSQL 16", port: "5432", role: "Primary datastore, 27 schemas, RLS" },
  { service: "Redis 7", port: "6379", role: "Cache, sessions, device retry queue" },
  { service: "Kafka", port: "9092", role: "Domain events, async pipelines" },
  { service: "ClickHouse", port: "8123", role: "Analytics OLAP warehouse" },
  { service: "MinIO (S3)", port: "9002", role: "Data lake, documents, reports" },
  { service: "Jaeger", port: "16686", role: "Distributed tracing" },
  { service: "Grafana", port: "3200", role: "Dashboards, SLA monitoring" },
  { service: "Superset", port: "8088", role: "BI and executive analytics" },
];

const SOC_CAPABILITIES = [
  { cap: "SIEM Integration", detail: "POST /api/v1/security/siem/ingest" },
  { cap: "Threat Detection", detail: "Runtime anomaly + rule engine" },
  { cap: "Incident Management", detail: "Full lifecycle CRUD" },
  { cap: "WAF / DDoS", detail: "Edge protection status + block rules" },
  { cap: "Certificate Lifecycle", detail: "Auto-renew, expiry alerts" },
  { cap: "Secret Rotation", detail: "JWT, API keys, DB credentials" },
  { cap: "Vulnerability Scanning", detail: "CVE tracking + remediation" },
  { cap: "Penetration Test Tracking", detail: "External VAPT engagements" },
];

function ServiceTable({ title, rows }: { title: string; rows: ServiceRow[] }) {
  return (
    <Stack gap={4}>
      <H3>{title}</H3>
      <Table
        headers={["Service", "Port", "Domain", "Phase"]}
        rows={rows.map((s) => [s.service, s.port, s.domain, s.phase])}
        columnAlign={["left", "center", "left", "center"]}
        striped
      />
    </Stack>
  );
}

export default function HealthcareEcosystemArchitecture() {
  const allServices = [
    ...CORE_SERVICES,
    ...LIMS_SERVICES,
    ...CLINICAL_SERVICES,
    ...ENTERPRISE_SERVICES,
    ...LAUNCH_SERVICES,
  ];

  return (
    <Stack gap={24} style={{ padding: 24, maxWidth: 1280 }}>
      <Stack gap={8}>
        <H1>HealthEcosystem — Full Platform Architecture</H1>
        <Text tone="secondary" size="small">
          Enterprise multi-tenant Healthcare SaaS — LIMS, EHR, PMS, Billing, Device Integration,
          PACS/RIS, ABDM, AI, SOC, Compliance, and Commercial Launch. Turborepo monorepo with
          NestJS CQRS microservices, Next.js 15 apps, PostgreSQL multi-schema, and EKS production stack.
        </Text>
        <Row gap={8} wrap>
          <Pill tone="success">Phases 1–30 Built</Pill>
          <Pill tone="info">Go-to-Market Active</Pill>
          <Pill tone="neutral">Multi-Tenant RLS</Pill>
          <Pill tone="neutral">Event-Driven Kafka</Pill>
          <Pill tone="neutral">CQRS + DDD</Pill>
        </Row>
      </Stack>

      <Grid columns={6} gap={12}>
        <Stat label="Microservices" value="31" tone="accent" />
        <Stat label="Web/Mobile Apps" value="4" tone="default" />
        <Stat label="Prisma Schemas" value="27" tone="default" />
        <Stat label="Admin Pages" value="150+" tone="default" />
        <Stat label="Unit Tests" value="550+" tone="default" />
        <Stat label="Compliance Packs" value="8" tone="default" />
      </Grid>

      <CollapsibleSection title="Implementation Phases" subtitle="Phases 1–30 complete · Go-to-market in progress" defaultOpen>
        <Stack gap={12}>
          <BarChart
            horizontal
            categories={PHASES.map((p) => p.range)}
            series={[{ name: "Modules delivered", data: [10, 4, 1, 2, 6, 7, 7, 6, 1], tone: "success" }]}
            height={220}
          />
          <Text tone="tertiary" size="small">Source: HealthEcosystem phase docs · module count per phase group</Text>
          <Table
            headers={["Phase", "Title", "Modules", "Status"]}
            rows={PHASES.map((p) => [
              p.range,
              p.title,
              p.modules,
              <Pill key={p.range} tone={p.status === "Complete" ? "success" : "warning"} size="sm">{p.status}</Pill>,
            ])}
            columnAlign={["left", "left", "left", "center"]}
            striped
          />
        </Stack>
      </CollapsibleSection>

      <CollapsibleSection title="Architecture Layers" subtitle="Clean Architecture + DDD + CQRS" defaultOpen>
        <Callout tone="info" title="Request Flow">
          Client (Next.js) → API Gateway (:3000) → NestJS service → Prisma (PostgreSQL RLS)
          → Redis → Kafka event → consumers (analytics, audit, workflow)
        </Callout>
        <Grid columns={2} gap={16} style={{ marginTop: 12 }}>
          <Card variant="outline">
            <CardHeader title="Presentation" />
            <CardBody>
              <Text tone="secondary" size="small">
                web-admin (3100) · patient-mobile (3110) · phlebotomist-app (3120) · partner-portal (3130)
              </Text>
            </CardBody>
          </Card>
          <Card variant="outline">
            <CardHeader title="API & Security" />
            <CardBody>
              <Text tone="secondary" size="small">
                JWT + MFA · RBAC · x-tenant-id · rate limit 120/min · WAF · SIEM
              </Text>
            </CardBody>
          </Card>
          <Card variant="outline">
            <CardHeader title="Application" />
            <CardBody>
              <Text tone="secondary" size="small">
                NestJS 10 · CQRS · @health/events · Swagger per service
              </Text>
            </CardBody>
          </Card>
          <Card variant="outline">
            <CardHeader title="Data" />
            <CardBody>
              <Text tone="secondary" size="small">
                PostgreSQL 27 schemas · Redis · ClickHouse · MinIO S3 lake
              </Text>
            </CardBody>
          </Card>
        </Grid>
      </CollapsibleSection>

      <CollapsibleSection title="Device Integration Pipeline" subtitle="Instrument → LIMS auto-import" defaultOpen>
        <Card>
          <CardBody>
            <Text tone="secondary" size="small" style={{ fontFamily: "monospace", lineHeight: 1.8 }}>
              Instrument → Gateway → Protocol Handler (ASTM/HL7/FHIR/DICOM) → Integration Engine
              → Vendor Adapter → Clinical Validation → LIMS Import → Kafka
            </Text>
          </CardBody>
        </Card>
        <Stack gap={8} style={{ marginTop: 12 }}>
          <H3>Device Certification Matrix</H3>
          <Table
            headers={["Vendor", "Protocol", "Model", "Parser", "Live Tested"]}
            rows={DEVICE_VENDORS.map((d) => [
              d.vendor,
              d.protocol,
              d.model,
              <Pill key={`p-${d.vendor}`} tone="success" size="sm">{d.parser}</Pill>,
              <Pill key={`l-${d.vendor}`} tone="warning" size="sm">{d.live}</Pill>,
            ])}
            columnAlign={["left", "left", "left", "center", "center"]}
            striped
          />
        </Stack>
      </CollapsibleSection>

      <CollapsibleSection title="Microservices — 31 Services" subtitle="Ports 3000–3030 · api-gateway routing" defaultOpen>
        <Stack gap={16}>
          <ServiceTable title="Core Platform" rows={CORE_SERVICES} />
          <ServiceTable title="LIMS & Operations" rows={LIMS_SERVICES} />
          <ServiceTable title="Clinical & Field" rows={CLINICAL_SERVICES} />
          <ServiceTable title="Enterprise Platform" rows={ENTERPRISE_SERVICES} />
          <ServiceTable title="Commercial Launch (25–30)" rows={LAUNCH_SERVICES} />
          <Text tone="tertiary" size="small">
            {allServices.length} services + 4 apps = 35 runtime components
          </Text>
        </Stack>
      </CollapsibleSection>

      <Grid columns={2} gap={16}>
        <CollapsibleSection title="Applications" subtitle="4 Next.js apps" defaultOpen>
          <Table
            headers={["App", "Port", "Users", "Pages"]}
            rows={APPS.map((a) => [a.app, a.port, a.users, a.pages])}
            columnAlign={["left", "center", "left", "center"]}
            striped
          />
        </CollapsibleSection>
        <CollapsibleSection title="Database Schemas" subtitle="27 PostgreSQL schemas" defaultOpen>
          <Row gap={6} wrap>
            {PRISMA_SCHEMAS.map((s) => (
              <Pill key={s} tone="neutral" size="sm">{s}</Pill>
            ))}
          </Row>
        </CollapsibleSection>
      </Grid>

      <CollapsibleSection title="Infrastructure" subtitle="Docker Compose local · EKS production">
        <Table
          headers={["Component", "Port", "Role"]}
          rows={INFRA.map((i) => [i.service, i.port, i.role])}
          columnAlign={["left", "center", "left"]}
          striped
        />
      </CollapsibleSection>

      <CollapsibleSection title="Golden E2E Workflows" subtitle="pnpm verify:golden-workflows" defaultOpen>
        <Stack gap={8}>
          {GOLDEN_WORKFLOWS.map((w) => (
            <Card key={w.name} variant="outline" size="sm">
              <CardHeader title={w.name} trailing={<Pill tone="info" size="sm">Automated</Pill>} />
              <CardBody><Text tone="secondary" size="small">{w.steps}</Text></CardBody>
            </Card>
          ))}
        </Stack>
      </CollapsibleSection>

      <Grid columns={2} gap={16}>
        <CollapsibleSection title="Compliance Frameworks" subtitle="8 packs in compliance-service">
          <Table
            headers={["Framework", "Scope"]}
            rows={COMPLIANCE.map((c) => [c.framework, c.scope])}
            striped
          />
        </CollapsibleSection>
        <CollapsibleSection title="Security Operations (SOC)" subtitle="security-service :3027">
          <Stack gap={8}>
            {SOC_CAPABILITIES.map((s) => (
              <Row key={s.cap} gap={12} align="start">
                <Pill tone="neutral" size="sm">{s.cap}</Pill>
                <Text tone="secondary" size="small" style={{ flex: 1 }}>{s.detail}</Text>
              </Row>
            ))}
          </Stack>
        </CollapsibleSection>
      </Grid>

      <CollapsibleSection title="Commercial Pricing" subtitle="commercial-service + partner-portal">
        <Table
          headers={["Segment", "Plan Code", "Monthly (INR)", "Branches", "Users"]}
          rows={PRICING.map((p) => [p.tier, p.code, p.monthly, p.branches, p.users])}
          columnAlign={["left", "left", "right", "center", "center"]}
          striped
        />
      </CollapsibleSection>

      <Grid columns={2} gap={16}>
        <CollapsibleSection title="Performance Certification" subtitle="Phase 26 targets">
          <Table
            headers={["Metric", "Target", "Tool"]}
            rows={SCALE_TARGETS.map((s) => [s.metric, s.target, s.tool])}
            striped
          />
        </CollapsibleSection>
        <CollapsibleSection title="Production Kubernetes" subtitle="Phase 27 EKS stack">
          <Table
            headers={["Component", "Role"]}
            rows={K8S_STACK.map((k) => [k.component, k.role])}
            striped
          />
        </CollapsibleSection>
      </Grid>

      <CollapsibleSection title="Pilot Pre-Flight Verification" subtitle="Run before any pilot customer" defaultOpen>
        <Stack gap={16}>
          <Table
            headers={["Command", "Purpose"]}
            rows={VERIFY_COMMANDS.map((v) => [<Code key={v.cmd}>{v.cmd}</Code>, v.purpose])}
            striped
          />
          <Callout tone="warning" title="Pilot Gate">
            Can 3–5 real labs run daily operations for 90 days without major workflow, clinical,
            security, or performance failures?
          </Callout>
        </Stack>
      </CollapsibleSection>

      <CollapsibleSection title="Production Readiness Scorecard" subtitle="Target 90%+ before enterprise sales" defaultOpen>
        <Stack gap={12}>
          <UsageBar
            total={100}
            topLeftLabel="Weighted readiness areas"
            topRightLabel="Target: 90%+"
            segments={[
              { id: "functional", value: 20, color: "blue" },
              { id: "security", value: 20, color: "purple" },
              { id: "clinical", value: 20, color: "green" },
              { id: "performance", value: 15, color: "orange" },
              { id: "dr", value: 10, color: "yellow" },
              { id: "compliance", value: 10, color: "pink" },
              { id: "docs", value: 5, color: "gray" },
            ]}
          />
          <Grid columns={4} gap={8}>
            {[
              { label: "Functional 20%", cmd: "verify:pilot" },
              { label: "Security 20%", cmd: "verify:security + VAPT" },
              { label: "Clinical 20%", cmd: "Pathologist sign-off" },
              { label: "Performance 15%", cmd: "verify:performance" },
            ].map((a) => (
              <Card key={a.label} variant="outline" size="sm">
                <CardHeader title={a.label} />
                <CardBody><Text tone="secondary" size="small">{a.cmd}</Text></CardBody>
              </Card>
            ))}
          </Grid>
          <TodoListCard todos={PILOT_TODOS} defaultExpanded />
        </Stack>
      </CollapsibleSection>

      <CollapsibleSection title="Technology Stack">
        <Table
          headers={["Layer", "Technologies"]}
          rows={[
            ["Monorepo", "Turborepo + pnpm 9 · TypeScript 5.7 · 35 packages"],
            ["Frontend", "Next.js 15 · Tailwind · @health/design-system"],
            ["Backend", "NestJS 10 · CQRS · Prisma 6 · Jest · Swagger"],
            ["Database", "PostgreSQL 16 · Redis 7 · ClickHouse · Elasticsearch"],
            ["Messaging", "Kafka events · Redis retry/DLQ for devices"],
            ["Cloud", "AWS EKS · RDS · S3 · MSK · CloudFront · WAF"],
            ["DevOps", "Docker Compose · ArgoCD · Istio · Karpenter · Velero"],
            ["Observability", "OpenTelemetry · Jaeger · Grafana · SLA dashboards"],
          ]}
          striped
        />
      </CollapsibleSection>

      <Card>
        <CardHeader title="Documentation Index" trailing={<Pill tone="success">30 Phases</Pill>} />
        <CardBody>
          <Grid columns={2} gap={8}>
            {[
              "docs/phase-1/ — Architecture (10 docs)",
              "docs/phase-3/ — Device Integration",
              "docs/phase-4/ — Master Data & Billing",
              "docs/phase-5-10/ — Platform Expansion",
              "docs/phase-11-17/ — Enterprise + DR",
              "docs/phase-18-24/ — Workflow, DMS, Agents",
              "docs/phase-25-30/ — SOC, K8s, Commercial",
              "docs/go-to-market/ — Pilot, VAPT, Clinical",
            ].map((doc) => (
              <Text key={doc} tone="secondary" size="small">{doc}</Text>
            ))}
          </Grid>
        </CardBody>
      </Card>
    </Stack>
  );
}
