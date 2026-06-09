# Clinical Sign-Off Pack

Store signed certificates in `docs/go-to-market/signoffs/` and upload copies to `compliance-service` evidence repository.

## Pathology Sign-Off

| Panel | Parameters | Device Source | Validator | Reg # | Date | Certificate |
|-------|-----------|---------------|-----------|-------|------|-------------|
| CBC | WBC, RBC, HGB, PLT | Sysmex XN | | | | `signoffs/pathology-cbc.pdf` |
| LFT | ALT, AST, ALP, Bili | Roche Cobas | | | | `signoffs/pathology-lft.pdf` |
| KFT | Urea, Creatinine, eGFR | Roche Cobas | | | | `signoffs/pathology-kft.pdf` |
| Lipid Profile | TC, HDL, LDL, TG | Abbott Architect | | | | `signoffs/pathology-lipid.pdf` |
| Thyroid | TSH, T3, T4 | Abbott Architect | | | | `signoffs/pathology-thyroid.pdf` |
| HbA1c | HbA1c | Roche Cobas | | | | `signoffs/pathology-hba1c.pdf` |

### Validation Method

- 100 samples per panel: manual vs device import vs reference lab
- Reference ranges verified for adult male, female, pediatric
- Critical values trigger workflow escalation
- Report format NABL/CAP compliant

## Radiology Sign-Off

| Modality | Workflow Steps | Validator | Reg # | Date | Certificate |
|----------|---------------|-----------|-------|------|-------------|
| X-Ray | DICOM → PACS → Report → Release | | | | `signoffs/radiology-xray.pdf` |
| CT | DICOM → PACS → Report → Release | | | | `signoffs/radiology-ct.pdf` |
| MRI | DICOM → PACS → Report → Release | | | | `signoffs/radiology-mri.pdf` |

## Gate

**Zero paying customers** until pathologist + radiologist sign-off complete for modules in scope.

Automated workflow verification:

```bash
pnpm verify:golden-workflows --workflow diagnostic
pnpm verify:golden-workflows --workflow radiology
```
