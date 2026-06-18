import { DeviceVendor } from '@health/db';
import { GenericAdapter } from './generic.adapter';
import type { VendorAdapter, AdapterContext } from './adapter.types';
import type { NormalizedResult, ParsedProtocolPayload } from '../protocols/protocol.types';

const ROCHE_TEST_MAP: Record<string, string> = {
  GLU: 'GLUCOSE',
  HGB: 'HEMOGLOBIN',
  CREA: 'CREATININE',
  ALT: 'ALANINE_AMINOTRANSFERASE',
  AST: 'ASPARTATE_AMINOTRANSFERASE',
};

export class RocheAdapter implements VendorAdapter {
  readonly vendor = DeviceVendor.ROCHE;
  private readonly generic = new GenericAdapter();

  mapToNormalized(parsed: ParsedProtocolPayload, context?: AdapterContext): NormalizedResult[] {
    const mergedContext: AdapterContext = {
      ...context,
      fieldMapping: { ...ROCHE_TEST_MAP, ...context?.fieldMapping },
    };

    if (parsed.protocol !== 'HL7_V2') {
      return this.generic.mapToNormalized(parsed, mergedContext);
    }

    return this.generic.mapToNormalized(parsed, mergedContext).map((result) => ({
      ...result,
      parameterCode: ROCHE_TEST_MAP[result.parameterCode] ?? result.parameterCode,
    }));
  }
}
