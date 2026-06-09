# 3. Clinical Validation

**Critical for liability and NABL accreditation.** Software correctness ≠ clinical correctness.

## Validation Team

| Role | Count | Responsibility |
|------|-------|----------------|
| Pathologist | 2 | Result accuracy, critical values, reference ranges |
| Radiologist | 1 | Report workflow, DICOM, PACS |
| Lab Manager | 2 | Workflow, TAT, device import accuracy |
| QC Manager | 1 | Westgard rules, CAPA workflows |

## Pathology Validation

### Result Accuracy Matrix

Test **minimum 50 parameters** across instrument types:

| Category | Parameters | Device Source | Manual vs Import Match | Status |
|----------|-----------|---------------|------------------------|--------|
| Hematology | CBC (13 params) | Sysmex XN | ±0 acceptable | ☐ |
| Biochemistry | LFT, KFT, Lipid | Roche Cobas | ±2% or ±0.1 unit | ☐ |
| Immunology | TSH, HbA1c | Abbott Architect | Within CV% | ☐ |
| Coagulation | PT, INR | Siemens | ±0.1 INR | ☐ |
| Urinalysis | Dipstick + microscopy | Manual entry | N/A | ☐ |

### Reference Ranges

| Test | Adult Male | Adult Female | Pediatric | Geriatric | Status |
|------|-----------|--------------|-----------|-----------|--------|
| Hemoglobin | Correct range + flag | Correct range + flag | Age-banded | Adjusted | ☐ |
| Creatinine | eGFR calculated | eGFR calculated | Pediatric formula | — | ☐ |
| Glucose (fasting) | Normal/high/low flags | Same | Pediatric range | — | ☐ |

### Critical Values (Delta Check)

| Parameter | Critical Low | Critical High | Notification Sent | Escalation Workflow | Status |
|-----------|---------------|---------------|---------------------|---------------------|--------|
| Potassium | < 2.5 | > 6.5 | ☐ | workflow-service triggered | ☐ |
| Glucose | < 40 | > 500 | ☐ | ☐ |
| Hemoglobin | < 7.0 | — | ☐ | ☐ |
| Troponin | — | > ULN × 10 | ☐ | ☐ |

### Device Import Accuracy

For each connected instrument:

1. Run QC sample on instrument
2. Capture raw ASTM/HL7 message (device-service logs)
3. Compare parsed values vs instrument display
4. Verify LIMS import matches parsed values
5. Verify units and decimal precision preserved
6. Sign-off by pathologist

| Instrument | Raw Parse OK | LIMS Import OK | Pathologist Sign-off | Status |
|------------|-------------|----------------|---------------------|--------|
| Sysmex XN-1000 | ☐ | ☐ | ☐ | ☐ |
| Roche Cobas 6000 | ☐ | ☐ | ☐ | ☐ |
| Abbott Architect i2000 | ☐ | ☐ | ☐ | ☐ |

## Radiology Validation

| Workflow Step | DICOM/PACS Check | Report Check | Status |
|---------------|-----------------|--------------|--------|
| Study scheduled | Modality worklist | — | ☐ |
| Study acquired | DICOM C-STORE received | — | ☐ |
| Images in PACS | WADO-RS retrieval | Viewer renders | ☐ |
| Radiologist reporting | Structured template | ☐ |
| Critical finding | Alert to referring physician | ☐ |
| Report signed | Digital signature in DMS | ☐ |
| Report released | Patient portal access | ☐ |

## Validation Protocol

1. **Blinded comparison:** 100 samples — manual entry vs device import vs reference lab
2. **Edge cases:** Hemolyzed, lipemic, icteric samples flagged correctly
3. **Report format:** NABL/CAP compliant layout, units, reference ranges, methodology
4. **Turnaround time:** Order-to-report within configured SLA

## Sign-Off Document

| Validator | Registration # | Date | Scope | Signature |
|-----------|---------------|------|-------|-----------|
| Pathologist 1 | | | Pathology | |
| Pathologist 2 | | | Pathology | |
| Radiologist | | | Radiology | |
| Lab Manager | | | Operations | |

Store signed validation report in `compliance-service` → Audit Evidence (NABL pack).

**Gate:** All pathology + radiology workflows signed off → proceed to NABL Pilot.
