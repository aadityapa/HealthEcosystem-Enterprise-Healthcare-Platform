# 03 — Database Schema

PostgreSQL 16 schema with **Row-Level Security (RLS)**, **tenant isolation**, and **partitioning** for high-volume tables.

---

## 1. Schema Organization

| Schema | Purpose |
|--------|---------|
| `core` | Tenants, organizations, branches, users, roles |
| `patient` | Patients, families, consents, documents, visits |
| `lims` | Tests, orders, samples, results, reports |
| `device` | Devices, adapters, messages, heartbeats |
| `ehr` | Diagnoses, prescriptions, allergies, clinical notes |
| `pms` | Doctors, schedules, appointments, queue, teleconsult |
| `billing` | Invoices, payments, insurance, GST |
| `collection` | Home collection requests, phlebotomist assignments |
| `integration` | ABDM, FHIR, HL7 logs |
| `analytics` | AI flags, risk scores, operational metrics |
| `audit` | Immutable audit trail |

---

## 2. Extensions & Enums

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gist";   -- exclusion constraints

-- Shared enums
CREATE TYPE core.tenant_tier AS ENUM ('starter', 'professional', 'enterprise', 'franchise');
CREATE TYPE core.tenant_status AS ENUM ('active', 'suspended', 'trial', 'churned');
CREATE TYPE core.branch_type AS ENUM ('hq', 'regional_lab', 'processing_lab', 'collection_center', 'franchise', 'clinic');
CREATE TYPE core.user_status AS ENUM ('active', 'inactive', 'locked', 'pending_verification');
CREATE TYPE core.gender AS ENUM ('male', 'female', 'other', 'unknown');
CREATE TYPE lims.sample_status AS ENUM (
  'ordered', 'collected', 'in_transit', 'received', 'processing',
  'result_pending', 'verified', 'approved', 'rejected', 'reported', 'archived'
);
CREATE TYPE lims.order_status AS ENUM ('draft', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded');
CREATE TYPE lims.result_flag AS ENUM ('normal', 'low', 'high', 'critical_low', 'critical_high', 'abnormal', 'panic');
CREATE TYPE device.vendor AS ENUM ('roche', 'abbott', 'siemens', 'sysmex', 'beckman_coulter', 'generic');
CREATE TYPE device.protocol AS ENUM ('astm', 'hl7_v2', 'fhir', 'dicom', 'proprietary');
CREATE TYPE billing.invoice_status AS ENUM ('draft', 'issued', 'partially_paid', 'paid', 'void', 'refunded');
CREATE TYPE billing.payment_method AS ENUM ('cash', 'card', 'upi', 'netbanking', 'wallet', 'insurance', 'corporate');
CREATE TYPE patient.consent_type AS ENUM ('treatment', 'data_sharing', 'marketing', 'abdm_hie', 'teleconsult');
CREATE TYPE audit.action_type AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'release');
```

---

## 3. Core Schema

```sql
CREATE SCHEMA IF NOT EXISTS core;

CREATE TABLE core.tenants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(63) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    tier            core.tenant_tier NOT NULL DEFAULT 'professional',
    status          core.tenant_status NOT NULL DEFAULT 'trial',
    settings        JSONB NOT NULL DEFAULT '{}',
    data_region     VARCHAR(32) NOT NULL DEFAULT 'ap-south-1',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE core.organizations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
    legal_name      VARCHAR(255) NOT NULL,
    trade_name      VARCHAR(255),
    gstin           VARCHAR(15),
    pan             VARCHAR(10),
    org_type        VARCHAR(32) NOT NULL DEFAULT 'diagnostic',
    settings        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, gstin)
);

CREATE TABLE core.branches (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES core.tenants(id),
    organization_id     UUID NOT NULL REFERENCES core.organizations(id),
    parent_branch_id    UUID REFERENCES core.branches(id),
    code                VARCHAR(32) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    branch_type         core.branch_type NOT NULL,
    address             JSONB NOT NULL DEFAULT '{}',
    contact             JSONB NOT NULL DEFAULT '{}',
    is_collection_center BOOLEAN NOT NULL DEFAULT FALSE,
    is_processing_lab   BOOLEAN NOT NULL DEFAULT FALSE,
    timezone            VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, code)
);

CREATE TABLE core.users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    password_hash   VARCHAR(255),
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100),
    status          core.user_status NOT NULL DEFAULT 'pending_verification',
    mfa_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret      TEXT,  -- encrypted
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, email)
);

CREATE TABLE core.roles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID REFERENCES core.tenants(id),  -- NULL = system role
    code            VARCHAR(64) NOT NULL,
    name            VARCHAR(128) NOT NULL,
    description     TEXT,
    is_system       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, code)
);

CREATE TABLE core.permissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(128) NOT NULL UNIQUE,
    module          VARCHAR(64) NOT NULL,
    action          VARCHAR(32) NOT NULL,
    description     TEXT
);

CREATE TABLE core.role_permissions (
    role_id         UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES core.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE core.user_roles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    role_id         UUID NOT NULL REFERENCES core.roles(id),
    branch_id       UUID REFERENCES core.branches(id),  -- branch-scoped role
    granted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by      UUID REFERENCES core.users(id),
    UNIQUE (user_id, role_id, branch_id)
);

CREATE TABLE core.user_branches (
    user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    branch_id       UUID NOT NULL REFERENCES core.branches(id) ON DELETE CASCADE,
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, branch_id)
);

CREATE INDEX idx_branches_tenant ON core.branches(tenant_id);
CREATE INDEX idx_users_tenant ON core.users(tenant_id);
CREATE INDEX idx_user_roles_user ON core.user_roles(user_id);
```

---

## 4. Patient Schema

```sql
CREATE SCHEMA IF NOT EXISTS patient;

CREATE TABLE patient.patients (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
    uhid            VARCHAR(32) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    middle_name     VARCHAR(100),
    last_name       VARCHAR(100),
    date_of_birth   DATE,
    gender          core.gender NOT NULL DEFAULT 'unknown',
    blood_group     VARCHAR(5),
    email           VARCHAR(255),
    phone           VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    address         JSONB NOT NULL DEFAULT '{}',
    abha_number     VARCHAR(64),  -- encrypted at application layer
    abha_address    VARCHAR(128),
    photo_url       TEXT,
    metadata        JSONB NOT NULL DEFAULT '{}',
    status          VARCHAR(32) NOT NULL DEFAULT 'active',
    registered_branch_id UUID REFERENCES core.branches(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES core.users(id),
    UNIQUE (tenant_id, uhid)
) PARTITION BY HASH (tenant_id);

-- Create 16 partitions for patients
CREATE TABLE patient.patients_p0 PARTITION OF patient.patients FOR VALUES WITH (MODULUS 16, REMAINDER 0);
CREATE TABLE patient.patients_p1 PARTITION OF patient.patients FOR VALUES WITH (MODULUS 16, REMAINDER 1);
-- ... p2 through p15

CREATE TABLE patient.patient_identifiers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    patient_id      UUID NOT NULL,
    id_type         VARCHAR(32) NOT NULL,  -- aadhaar, passport, employee_id, corporate_id
    id_value        TEXT NOT NULL,          -- encrypted
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patient.families (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
    family_code     VARCHAR(32) NOT NULL,
    head_patient_id UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, family_code)
);

CREATE TABLE patient.family_members (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id       UUID NOT NULL REFERENCES patient.families(id) ON DELETE CASCADE,
    patient_id      UUID NOT NULL,
    relationship    VARCHAR(32) NOT NULL,
    UNIQUE (family_id, patient_id)
);

CREATE TABLE patient.patient_consents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    patient_id      UUID NOT NULL,
    consent_type    patient.consent_type NOT NULL,
    status          VARCHAR(32) NOT NULL DEFAULT 'pending',
    granted_at      TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    revoked_at      TIMESTAMPTZ,
    abdm_artefact   JSONB,
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patient.patient_documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    patient_id      UUID NOT NULL,
    document_type   VARCHAR(64) NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    s3_key          TEXT NOT NULL,
    mime_type       VARCHAR(128),
    uploaded_by     UUID REFERENCES core.users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patient.patient_visits (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    patient_id      UUID NOT NULL,
    branch_id       UUID NOT NULL REFERENCES core.branches(id),
    visit_type      VARCHAR(32) NOT NULL,
    visit_number    VARCHAR(32) NOT NULL,
    check_in_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_at    TIMESTAMPTZ,
    status          VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patient.patient_timeline_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    patient_id      UUID NOT NULL,
    event_type      VARCHAR(64) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    reference_type  VARCHAR(64),
    reference_id    UUID,
    occurred_at     TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_tenant_uhid ON patient.patients(tenant_id, uhid);
CREATE INDEX idx_patients_phone ON patient.patients(tenant_id, phone);
CREATE INDEX idx_timeline_patient ON patient.patient_timeline_events(patient_id, occurred_at DESC);
```

---

## 5. LIMS Schema

```sql
CREATE SCHEMA IF NOT EXISTS lims;

CREATE TABLE lims.test_categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
    code            VARCHAR(32) NOT NULL,
    name            VARCHAR(128) NOT NULL,
    parent_id       UUID REFERENCES lims.test_categories(id),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (tenant_id, code)
);

CREATE TABLE lims.test_masters (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
    category_id     UUID NOT NULL REFERENCES lims.test_categories(id),
    code            VARCHAR(32) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    short_name      VARCHAR(64),
    specimen_type   VARCHAR(32) NOT NULL,
    container_type  VARCHAR(32),
    tat_hours       INTEGER NOT NULL DEFAULT 24,
    methodology     JSONB NOT NULL DEFAULT '{}',
    reference_ranges JSONB NOT NULL DEFAULT '[]',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, code)
);

CREATE TABLE lims.test_parameters (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    test_id         UUID NOT NULL REFERENCES lims.test_masters(id) ON DELETE CASCADE,
    code            VARCHAR(32) NOT NULL,
    name            VARCHAR(128) NOT NULL,
    unit            VARCHAR(32),
    data_type       VARCHAR(16) NOT NULL DEFAULT 'numeric',  -- numeric, text, coded
    decimal_places  SMALLINT DEFAULT 2,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    UNIQUE (test_id, code)
);

CREATE TABLE lims.test_pricing (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    test_id         UUID NOT NULL REFERENCES lims.test_masters(id),
    branch_id       UUID REFERENCES core.branches(id),  -- NULL = tenant default
    base_price      DECIMAL(12,2) NOT NULL,
    mrp             DECIMAL(12,2),
    corporate_price DECIMAL(12,2),
    effective_from  DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to    DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lims.package_masters (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
    code            VARCHAR(32) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    package_price   DECIMAL(12,2) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (tenant_id, code)
);

CREATE TABLE lims.package_tests (
    package_id      UUID NOT NULL REFERENCES lims.package_masters(id) ON DELETE CASCADE,
    test_id         UUID NOT NULL REFERENCES lims.test_masters(id),
    PRIMARY KEY (package_id, test_id)
);

CREATE TABLE lims.lab_orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    branch_id       UUID NOT NULL REFERENCES core.branches(id),
    patient_id      UUID NOT NULL,
    order_number    VARCHAR(32) NOT NULL,
    order_source    VARCHAR(32) NOT NULL DEFAULT 'walk_in',
    status          lims.order_status NOT NULL DEFAULT 'draft',
    priority        VARCHAR(16) NOT NULL DEFAULT 'routine',
    ordered_by      UUID REFERENCES core.users(id),
    referring_doctor VARCHAR(255),
    clinical_notes  TEXT,
    subtotal        DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, order_number)
);

CREATE TABLE lims.lab_order_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    lab_order_id    UUID NOT NULL REFERENCES lims.lab_orders(id) ON DELETE CASCADE,
    test_id         UUID REFERENCES lims.test_masters(id),
    package_id      UUID REFERENCES lims.package_masters(id),
    item_name       VARCHAR(255) NOT NULL,
    quantity        INTEGER NOT NULL DEFAULT 1,
    unit_price      DECIMAL(12,2) NOT NULL,
    discount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    line_total      DECIMAL(12,2) NOT NULL,
    status          VARCHAR(32) NOT NULL DEFAULT 'pending'
);

CREATE TABLE lims.samples (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               UUID NOT NULL,
    lab_order_id            UUID NOT NULL REFERENCES lims.lab_orders(id),
    lab_order_item_id       UUID NOT NULL REFERENCES lims.lab_order_items(id),
    sample_number           VARCHAR(32) NOT NULL,
    barcode                 VARCHAR(64) NOT NULL,
    qr_payload              TEXT,
    sample_type             VARCHAR(32) NOT NULL,
    status                  lims.sample_status NOT NULL DEFAULT 'ordered',
    collection_branch_id    UUID NOT NULL REFERENCES core.branches(id),
    processing_branch_id    UUID REFERENCES core.branches(id),
    collected_by            UUID REFERENCES core.users(id),
    collected_at            TIMESTAMPTZ,
    received_at             TIMESTAMPTZ,
    processed_at            TIMESTAMPTZ,
    verified_at             TIMESTAMPTZ,
    approved_at             TIMESTAMPTZ,
    rejected_at             TIMESTAMPTZ,
    rejection_reason        TEXT,
    storage_location        VARCHAR(64),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, barcode)
);

CREATE TABLE lims.sample_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    sample_id       UUID NOT NULL REFERENCES lims.samples(id) ON DELETE CASCADE,
    from_status     lims.sample_status,
    to_status       lims.sample_status NOT NULL,
    event_type      VARCHAR(64) NOT NULL,
    notes           TEXT,
    performed_by    UUID REFERENCES core.users(id),
    branch_id       UUID REFERENCES core.branches(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lims.sample_results (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    sample_id       UUID NOT NULL REFERENCES lims.samples(id) ON DELETE CASCADE,
    parameter_id    UUID NOT NULL REFERENCES lims.test_parameters(id),
    value           TEXT NOT NULL,
    unit            VARCHAR(32),
    flag            lims.result_flag NOT NULL DEFAULT 'normal',
    status          VARCHAR(32) NOT NULL DEFAULT 'pending',
    reference_range TEXT,
    device_id       UUID,
    raw_value       TEXT,
    verified_by     UUID REFERENCES core.users(id),
    verified_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (sample_id, parameter_id)
);

CREATE TABLE lims.reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    sample_id       UUID NOT NULL REFERENCES lims.samples(id),
    lab_order_id    UUID NOT NULL REFERENCES lims.lab_orders(id),
    report_number   VARCHAR(32) NOT NULL,
    status          VARCHAR(32) NOT NULL DEFAULT 'draft',
    template_id     UUID,
    pdf_s3_key      TEXT,
    released_at     TIMESTAMPTZ,
    released_by     UUID REFERENCES core.users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, report_number)
);

CREATE INDEX idx_samples_tenant_status ON lims.samples(tenant_id, status, created_at DESC);
CREATE INDEX idx_samples_barcode ON lims.samples(tenant_id, barcode);
CREATE INDEX idx_lab_orders_patient ON lims.lab_orders(patient_id, created_at DESC);
CREATE INDEX idx_sample_results_sample ON lims.sample_results(sample_id);
```

---

## 6. Device Schema

```sql
CREATE SCHEMA IF NOT EXISTS device;

CREATE TABLE device.devices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES core.tenants(id),
    branch_id       UUID NOT NULL REFERENCES core.branches(id),
    device_code     VARCHAR(64) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    vendor          device.vendor NOT NULL,
    model           VARCHAR(128),
    protocol        device.protocol NOT NULL,
    connection_type VARCHAR(32) NOT NULL,
    connection_config JSONB NOT NULL DEFAULT '{}',
    status          VARCHAR(32) NOT NULL DEFAULT 'offline',
    last_seen_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, device_code)
);

CREATE TABLE device.device_adapters (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id       UUID NOT NULL REFERENCES device.devices(id) ON DELETE CASCADE,
    adapter_version VARCHAR(16) NOT NULL,
    field_mapping   JSONB NOT NULL DEFAULT '{}',
    transformation_rules JSONB NOT NULL DEFAULT '{}',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE device.device_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    device_id       UUID NOT NULL REFERENCES device.devices(id),
    protocol        device.protocol NOT NULL,
    raw_payload     TEXT NOT NULL,
    parse_status    VARCHAR(32) NOT NULL DEFAULT 'pending',
    error_message   TEXT,
    retry_count     INTEGER NOT NULL DEFAULT 0,
    parsed_at       TIMESTAMPTZ,
    received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (received_at);

CREATE TABLE device.device_heartbeats (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id       UUID NOT NULL REFERENCES device.devices(id),
    status          VARCHAR(32) NOT NULL,
    metrics         JSONB NOT NULL DEFAULT '{}',
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_device_messages_device ON device.device_messages(device_id, received_at DESC);
```

---

## 7. Row-Level Security

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE patient.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE lims.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lims.samples ENABLE ROW LEVEL SECURITY;

-- Application sets: SET app.current_tenant = '<uuid>';
CREATE POLICY tenant_isolation_patients ON patient.patients
    USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY tenant_isolation_orders ON lims.lab_orders
    USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY tenant_isolation_samples ON lims.samples
    USING (tenant_id = current_setting('app.current_tenant', true)::UUID);
```

---

## 8. UHID Generation Function

```sql
CREATE OR REPLACE FUNCTION patient.generate_uhid(p_tenant_id UUID, p_branch_id UUID)
RETURNS VARCHAR(32) AS $$
DECLARE
    v_branch_code VARCHAR(8);
    v_seq BIGINT;
    v_uhid VARCHAR(32);
BEGIN
    SELECT code INTO v_branch_code FROM core.branches WHERE id = p_branch_id;
    SELECT nextval('patient.uhid_seq_' || replace(p_tenant_id::TEXT, '-', '')) INTO v_seq;
    v_uhid := v_branch_code || TO_CHAR(NOW(), 'YYMM') || LPAD(v_seq::TEXT, 6, '0');
    RETURN v_uhid;
END;
$$ LANGUAGE plpgsql;
```

---

## 9. Audit Schema (Append-Only)

```sql
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE audit.audit_logs (
    id              UUID NOT NULL DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,
    user_id         UUID,
    action          audit.action_type NOT NULL,
    entity_type     VARCHAR(64) NOT NULL,
    entity_id       UUID,
    old_value       JSONB,
    new_value       JSONB,
    ip_address      INET,
    user_agent      TEXT,
    request_id      VARCHAR(64),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Monthly partitions created via pg_partman or migration job
CREATE TABLE audit.audit_logs_2026_06 PARTITION OF audit.audit_logs
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- Prevent updates/deletes
CREATE RULE audit_no_update AS ON UPDATE TO audit.audit_logs DO INSTEAD NOTHING;
CREATE RULE audit_no_delete AS ON DELETE TO audit.audit_logs DO INSTEAD NOTHING;
```

---

## 10. Elasticsearch Index Mapping (Summary)

```json
{
  "patients": {
    "mappings": {
      "properties": {
        "tenant_id": { "type": "keyword" },
        "uhid": { "type": "keyword" },
        "full_name": { "type": "text", "analyzer": "standard" },
        "phone": { "type": "keyword" },
        "email": { "type": "keyword" },
        "abha_address": { "type": "keyword" }
      }
    }
  },
  "lab_orders": {
    "mappings": {
      "properties": {
        "tenant_id": { "type": "keyword" },
        "order_number": { "type": "keyword" },
        "patient_name": { "type": "text" },
        "status": { "type": "keyword" },
        "created_at": { "type": "date" }
      }
    }
  }
}
```

---

## 11. Migration Strategy

1. **Flyway/Liquibase** versioned migrations per schema
2. **Zero-downtime**: expand-contract pattern for column changes
3. **Seed data**: system roles, permissions, default test categories
4. **Partition management**: automated monthly audit + device message partitions
