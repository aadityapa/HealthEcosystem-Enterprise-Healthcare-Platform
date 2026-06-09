# Device Certification Matrix

**Simulation ≠ production certification.** Parser tests prove code works; live instrument tests prove clinical safety.

## Certification Status

| Device | Vendor | Protocol | Parser Tested | Live Instrument Tested | Sign-Off Date | Engineer |
|--------|--------|----------|---------------|------------------------|---------------|----------|
| Cobas c501 | Roche | HL7 v2 | ☐ `pnpm verify:device-import` | ☐ | | |
| Architect i2000 | Abbott | HL7 v2 | ☐ | ☐ | | |
| Atellica | Siemens | HL7 v2 | ☐ | ☐ | | |
| XN-1000 | Sysmex | HL7 v2 | ☐ | ☐ | | |
| AU5800 | Beckman | ASTM | ☐ | ☐ | | |

## Live Validation Protocol (Per Device)

1. Connect instrument to device-gateway on isolated VLAN
2. Run 3 QC samples (low, normal, high)
3. Capture raw ASTM/HL7 message from `device-service` logs
4. Compare parsed values vs instrument display (±tolerance)
5. Verify LIMS auto-import matches barcode-linked sample
6. Verify units, decimal precision, reference range flags
7. Biomedical engineer sign-off
8. Pathologist sign-off on 10 patient samples

## Automated Baseline

```bash
pnpm verify:device-import
pnpm --filter @health/device-service test
```

## Gate

No device goes to production for a pilot site until **Live Instrument Tested = ✓** for that vendor.
