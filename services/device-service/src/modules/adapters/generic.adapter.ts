import { DeviceVendor } from '@health/db';
import { extractAstmResults } from '../protocols/astm.parser';
import type { VendorAdapter, AdapterContext } from './adapter.types';
import type { NormalizedResult, ParsedProtocolPayload } from '../protocols/protocol.types';

export class GenericAdapter implements VendorAdapter {
  readonly vendor = DeviceVendor.GENERIC;

  mapToNormalized(parsed: ParsedProtocolPayload, context?: AdapterContext): NormalizedResult[] {
    const barcodeField = context?.fieldMapping?.sampleBarcode ?? 'sampleBarcode';

    switch (parsed.protocol) {
      case 'ASTM': {
        const barcode = parsed.data.sampleBarcode ?? '';
        const results = extractAstmResults(parsed.data.records);
        return results.map((r) => ({
          sampleBarcode: barcode,
          parameterCode: this.mapField(r.parameterCode, context),
          value: r.value,
          unit: r.unit,
          rawValue: r.rawValue,
          messageControlId: parsed.data.messageControlId,
        }));
      }
      case 'HL7_V2': {
        const barcode = parsed.data.sampleBarcode ?? '';
        return parsed.data.observations.map((obs) => ({
          sampleBarcode: barcode,
          parameterCode: this.mapField(obs.parameterCode, context),
          value: obs.value,
          unit: obs.unit,
          rawValue: obs.value,
          messageControlId: parsed.data.messageControlId,
          observedAt: obs.observedAt,
        }));
      }
      case 'FHIR': {
        const barcode = parsed.data.sampleBarcode ?? '';
        return parsed.data.observations.map((obs) => ({
          sampleBarcode: barcode,
          parameterCode: this.mapField(obs.code, context),
          value: obs.value,
          unit: obs.unit,
          observedAt: obs.effectiveDateTime,
        }));
      }
      case 'DICOM': {
        const barcode = parsed.data.accessionNumber ?? parsed.data.patientId ?? '';
        return [
          {
            sampleBarcode: barcode,
            parameterCode: 'DICOM_METADATA',
            value: parsed.data.modality ?? 'UNKNOWN',
            rawValue: JSON.stringify(parsed.data.metadata),
          },
        ];
      }
      default:
        return [];
    }
  }

  private mapField(code: string, context?: AdapterContext): string {
    const mapping = context?.fieldMapping ?? {};
    return mapping[code] ?? code;
  }
}
