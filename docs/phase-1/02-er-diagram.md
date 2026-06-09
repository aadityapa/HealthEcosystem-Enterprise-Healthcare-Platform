# 02 — Entity-Relationship Diagram

## 1. ER Overview

The data model is organized around **Tenant → Organization → Branch** hierarchy with **Patient** and **User** as cross-cutting entities. LIMS, EHR, PMS, and Billing share the patient identity via `patient_id` / `uhid`.

---

## 2. Core Identity & Tenancy ER

```mermaid
erDiagram
    TENANT ||--o{ ORGANIZATION : owns
    ORGANIZATION ||--o{ BRANCH : has
    BRANCH ||--o{ DEPARTMENT : contains
    TENANT ||--o{ TENANT_LICENSE : has
    TENANT ||--o{ TENANT_CONFIG : configures

    USER ||--o{ USER_ROLE : assigned
    ROLE ||--o{ USER_ROLE : grants
    ROLE ||--o{ ROLE_PERMISSION : includes
    PERMISSION ||--o{ ROLE_PERMISSION : defines
    USER ||--o{ USER_BRANCH : scoped_to
    BRANCH ||--o{ USER_BRANCH : scopes

    TENANT {
        uuid id PK
        string slug UK
        string name
        enum tier
        enum status
        jsonb settings
        timestamp created_at
    }

    ORGANIZATION {
        uuid id PK
        uuid tenant_id FK
        string legal_name
        string gstin
        string pan
        enum org_type
    }

    BRANCH {
        uuid id PK
        uuid tenant_id FK
        uuid organization_id FK
        uuid parent_branch_id FK
        enum branch_type
        string code UK
        string name
        jsonb address
        boolean is_collection_center
        boolean is_processing_lab
    }

    USER {
        uuid id PK
        uuid tenant_id FK
        string email UK
        string phone
        string password_hash
        boolean mfa_enabled
        enum status
    }

    ROLE {
        uuid id PK
        uuid tenant_id FK
        string code
        string name
        enum scope
    }
```

---

## 3. Patient Domain ER

```mermaid
erDiagram
    PATIENT ||--o{ PATIENT_IDENTIFIER : has
    PATIENT ||--o{ FAMILY_MEMBER : belongs_to
    FAMILY ||--o{ FAMILY_MEMBER : contains
    PATIENT ||--o{ PATIENT_CONSENT : grants
    PATIENT ||--o{ PATIENT_DOCUMENT : stores
    PATIENT ||--o{ PATIENT_VISIT : visits
    PATIENT ||--o{ PATIENT_TIMELINE_EVENT : tracks

    PATIENT {
        uuid id PK
        uuid tenant_id FK
        string uhid UK
        string first_name
        string last_name
        date date_of_birth
        enum gender
        string abha_address
        string abha_number
        jsonb contact
        jsonb address
        enum status
    }

    PATIENT_IDENTIFIER {
        uuid id PK
        uuid patient_id FK
        enum id_type
        string id_value
        boolean is_primary
    }

    FAMILY {
        uuid id PK
        uuid tenant_id FK
        uuid head_patient_id FK
        string family_code
    }

    PATIENT_CONSENT {
        uuid id PK
        uuid patient_id FK
        enum consent_type
        enum status
        timestamp granted_at
        timestamp expires_at
        jsonb abdm_consent_artefact
    }

    PATIENT_VISIT {
        uuid id PK
        uuid patient_id FK
        uuid branch_id FK
        enum visit_type
        timestamp check_in_at
        enum status
    }
```

---

## 4. LIMS Domain ER

```mermaid
erDiagram
    TEST_CATEGORY ||--o{ TEST_MASTER : categorizes
    TEST_MASTER ||--o{ TEST_PARAMETER : defines
    TEST_MASTER ||--o{ TEST_PRICING : priced_at
    PACKAGE_MASTER ||--o{ PACKAGE_TEST : includes
    TEST_MASTER ||--o{ PACKAGE_TEST : part_of

    LAB_ORDER ||--o{ LAB_ORDER_ITEM : contains
    LAB_ORDER ||--o{ SAMPLE : generates
    LAB_ORDER_ITEM }o--|| TEST_MASTER : references
    LAB_ORDER_ITEM }o--o| PACKAGE_MASTER : references

    SAMPLE ||--o{ SAMPLE_EVENT : tracks
    SAMPLE ||--o{ SAMPLE_RESULT : produces
    SAMPLE ||--o{ SAMPLE_STORAGE : stored_in
    TEST_PARAMETER ||--o{ SAMPLE_RESULT : measured

    SAMPLE ||--o{ BARCODE : labeled
    SAMPLE ||--o{ REPORT : releases

    LAB_ORDER {
        uuid id PK
        uuid tenant_id FK
        uuid branch_id FK
        uuid patient_id FK
        string order_number UK
        enum order_source
        enum status
        uuid ordered_by FK
        decimal total_amount
    }

    SAMPLE {
        uuid id PK
        uuid tenant_id FK
        uuid lab_order_id FK
        uuid lab_order_item_id FK
        string sample_number UK
        string barcode UK
        enum sample_type
        enum status
        uuid collection_branch_id FK
        uuid processing_branch_id FK
        timestamp collected_at
        timestamp received_at
        timestamp verified_at
    }

    TEST_MASTER {
        uuid id PK
        uuid tenant_id FK
        uuid category_id FK
        string code UK
        string name
        enum specimen_type
        jsonb reference_ranges
        jsonb methodology
        boolean is_active
    }

    SAMPLE_RESULT {
        uuid id PK
        uuid sample_id FK
        uuid parameter_id FK
        string value
        string unit
        enum flag
        enum status
        uuid verified_by FK
        uuid device_id FK
    }

    REPORT {
        uuid id PK
        uuid sample_id FK
        uuid lab_order_id FK
        string report_number UK
        enum status
        string pdf_url
        timestamp released_at
        uuid released_by FK
    }
```

---

## 5. Device Integration ER

```mermaid
erDiagram
    DEVICE ||--o{ DEVICE_ADAPTER : uses
    DEVICE ||--o{ DEVICE_MESSAGE : receives
    DEVICE ||--o{ DEVICE_HEARTBEAT : monitors
    DEVICE_MESSAGE ||--o| PARSED_RESULT : parses_to
    PARSED_RESULT ||--o| SAMPLE_RESULT : maps_to

    DEVICE {
        uuid id PK
        uuid tenant_id FK
        uuid branch_id FK
        string device_code UK
        string name
        enum vendor
        enum protocol
        enum connection_type
        jsonb connection_config
        enum status
    }

    DEVICE_ADAPTER {
        uuid id PK
        uuid device_id FK
        string adapter_version
        jsonb field_mapping
        jsonb transformation_rules
    }

    DEVICE_MESSAGE {
        uuid id PK
        uuid device_id FK
        text raw_payload
        enum protocol
        enum parse_status
        integer retry_count
        timestamp received_at
    }

    DEVICE_HEARTBEAT {
        uuid id PK
        uuid device_id FK
        enum status
        jsonb metrics
        timestamp recorded_at
    }
```

---

## 6. EHR Domain ER

```mermaid
erDiagram
    PATIENT ||--o{ DIAGNOSIS : has
    PATIENT ||--o{ PRESCRIPTION : has
    PATIENT ||--o{ ALLERGY : has
    PATIENT ||--o{ VACCINATION : has
    PATIENT ||--o{ CLINICAL_NOTE : has
    PATIENT ||--o{ MEDICAL_HISTORY : has
    PATIENT_VISIT ||--o{ CLINICAL_NOTE : documents

    PRESCRIPTION ||--o{ PRESCRIPTION_ITEM : contains
    CLINICAL_NOTE ||--o{ CLINICAL_ATTACHMENT : attaches

    DIAGNOSIS {
        uuid id PK
        uuid patient_id FK
        uuid visit_id FK
        string icd10_code
        string description
        enum status
        uuid diagnosed_by FK
    }

    PRESCRIPTION {
        uuid id PK
        uuid patient_id FK
        uuid visit_id FK
        uuid prescribed_by FK
        enum status
        timestamp prescribed_at
    }

    ALLERGY {
        uuid id PK
        uuid patient_id FK
        string allergen
        enum severity
        enum reaction_type
    }

    CLINICAL_NOTE {
        uuid id PK
        uuid patient_id FK
        uuid visit_id FK
        uuid author_id FK
        enum note_type
        text content
        boolean is_signed
    }
```

---

## 7. PMS Domain ER

```mermaid
erDiagram
    DOCTOR_PROFILE ||--o{ DOCTOR_SCHEDULE : has
    DOCTOR_PROFILE ||--o{ APPOINTMENT : attends
    PATIENT ||--o{ APPOINTMENT : books
    BRANCH ||--o{ APPOINTMENT : hosts
    APPOINTMENT ||--o| QUEUE_ENTRY : queued
    APPOINTMENT ||--o| TELECONSULT_SESSION : connects

    DOCTOR_PROFILE {
        uuid id PK
        uuid user_id FK
        uuid tenant_id FK
        string registration_number
        jsonb specializations
        jsonb consultation_fees
    }

    DOCTOR_SCHEDULE {
        uuid id PK
        uuid doctor_id FK
        uuid branch_id FK
        smallint day_of_week
        time start_time
        time end_time
        integer slot_duration_min
    }

    APPOINTMENT {
        uuid id PK
        uuid tenant_id FK
        uuid branch_id FK
        uuid patient_id FK
        uuid doctor_id FK
        timestamp scheduled_at
        enum type
        enum status
        enum payment_status
    }

    QUEUE_ENTRY {
        uuid id PK
        uuid appointment_id FK
        uuid branch_id FK
        integer queue_number
        enum status
        timestamp called_at
    }

    TELECONSULT_SESSION {
        uuid id PK
        uuid appointment_id FK
        string room_id
        enum status
        timestamp started_at
        timestamp ended_at
    }
```

---

## 8. Billing Domain ER

```mermaid
erDiagram
    LAB_ORDER ||--o| INVOICE : billed_as
    APPOINTMENT ||--o| INVOICE : billed_as
    INVOICE ||--o{ INVOICE_LINE : contains
    INVOICE ||--o{ PAYMENT : receives
    INVOICE ||--o{ INSURANCE_CLAIM : submits

    INVOICE {
        uuid id PK
        uuid tenant_id FK
        uuid branch_id FK
        uuid patient_id FK
        string invoice_number UK
        enum invoice_type
        enum status
        decimal subtotal
        decimal tax_amount
        decimal discount
        decimal total
        jsonb gst_details
    }

    INVOICE_LINE {
        uuid id PK
        uuid invoice_id FK
        string description
        decimal quantity
        decimal unit_price
        decimal tax_rate
        decimal line_total
        uuid reference_id
        enum reference_type
    }

    PAYMENT {
        uuid id PK
        uuid invoice_id FK
        enum method
        decimal amount
        string gateway_ref
        enum status
        timestamp paid_at
    }

    INSURANCE_CLAIM {
        uuid id PK
        uuid invoice_id FK
        string policy_number
        string tpa_name
        enum status
        decimal approved_amount
    }
```

---

## 9. Home Collection ER

```mermaid
erDiagram
    COLLECTION_REQUEST ||--o{ COLLECTION_REQUEST_ITEM : includes
    COLLECTION_REQUEST ||--o| PHLEBOTOMIST_ASSIGNMENT : assigned
    PHLEBOTOMIST_PROFILE ||--o{ PHLEBOTOMIST_ASSIGNMENT : performs
    COLLECTION_REQUEST ||--o| LAB_ORDER : creates

    COLLECTION_REQUEST {
        uuid id PK
        uuid tenant_id FK
        uuid patient_id FK
        uuid branch_id FK
        string request_number UK
        jsonb pickup_address
        timestamp preferred_slot_start
        timestamp preferred_slot_end
        enum status
    }

    PHLEBOTOMIST_PROFILE {
        uuid id PK
        uuid user_id FK
        uuid branch_id FK
        jsonb service_areas
        enum status
    }

    PHLEBOTOMIST_ASSIGNMENT {
        uuid id PK
        uuid request_id FK
        uuid phlebotomist_id FK
        jsonb route
        enum status
        timestamp assigned_at
        timestamp completed_at
    }
```

---

## 10. Integration & Compliance ER

```mermaid
erDiagram
    PATIENT ||--o{ ABHA_LINK : linked
    PATIENT ||--o{ FHIR_RESOURCE : exports
    TENANT ||--o{ HL7_MESSAGE_LOG : logs
    USER ||--o{ AUDIT_LOG : performs

    ABHA_LINK {
        uuid id PK
        uuid patient_id FK
        string abha_number
        string abha_address
        enum link_status
        timestamp linked_at
    }

    FHIR_RESOURCE {
        uuid id PK
        uuid tenant_id FK
        uuid patient_id FK
        enum resource_type
        jsonb resource_body
        string fhir_id
    }

    HL7_MESSAGE_LOG {
        uuid id PK
        uuid tenant_id FK
        enum message_type
        text raw_message
        enum direction
        enum status
        timestamp processed_at
    }

    AUDIT_LOG {
        uuid id PK
        uuid tenant_id FK
        uuid user_id FK
        string action
        string entity_type
        uuid entity_id
        jsonb old_value
        jsonb new_value
        inet ip_address
        timestamp created_at
    }
```

---

## 11. AI Analytics ER

```mermaid
erDiagram
    SAMPLE_RESULT ||--o{ ANOMALY_FLAG : flagged
    PATIENT ||--o{ HEALTH_RISK_SCORE : scored
    TENANT ||--o{ OPERATIONAL_METRIC : aggregates

    ANOMALY_FLAG {
        uuid id PK
        uuid sample_result_id FK
        enum anomaly_type
        float confidence
        jsonb explanation
        enum status
    }

    HEALTH_RISK_SCORE {
        uuid id PK
        uuid patient_id FK
        enum risk_category
        float score
        jsonb factors
        timestamp computed_at
    }

    OPERATIONAL_METRIC {
        uuid id PK
        uuid tenant_id FK
        uuid branch_id FK
        enum metric_type
        date metric_date
        jsonb values
    }
```

---

## 12. Key Relationships Summary

| From | To | Cardinality | Description |
|------|-----|-------------|-------------|
| Tenant | Organization | 1:N | SaaS tenant owns orgs |
| Organization | Branch | 1:N | Multi-branch hierarchy |
| Branch | Branch | 1:N | Parent/child (franchise tree) |
| Patient | LabOrder | 1:N | Patient orders tests |
| LabOrder | Sample | 1:N | Order generates samples |
| Sample | SampleResult | 1:N | Sample produces results |
| Sample | Report | 1:1 | Verified sample → report |
| Device | DeviceMessage | 1:N | Raw instrument data |
| DeviceMessage | SampleResult | 1:1 | Parsed → validated result |
| Patient | Appointment | 1:N | PMS scheduling |
| LabOrder | Invoice | 1:1 | Billing linkage |
| CollectionRequest | LabOrder | 1:1 | Home collection → lab order |

---

## 13. Indexing Strategy (Summary)

- All tables: `(tenant_id)` B-tree index
- Patient: `(tenant_id, uhid)` unique
- Sample: `(tenant_id, barcode)`, `(tenant_id, status, created_at)`
- LabOrder: `(tenant_id, order_number)`, `(patient_id, created_at DESC)`
- AuditLog: `(tenant_id, created_at DESC)` — partitioned monthly
- Full-text: Patient name, Test name → Elasticsearch
