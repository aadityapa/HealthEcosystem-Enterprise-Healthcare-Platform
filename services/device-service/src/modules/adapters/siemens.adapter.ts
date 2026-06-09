import { DeviceVendor } from '@health/db';
import { GenericAdapter } from './generic.adapter';
import type { VendorAdapter, AdapterContext } from './adapter.types';
import type { NormalizedResult, ParsedProtocolPayload } from '../protocols/protocol.types';

const SIEMENS_TEST_MAP: Record<string, string> = {
  Na: 'SODIUM',
  K: 'POTASSIUM',
  Cl: 'CHLORIDE',
  CREA: 'CREATININE',
  BUN: 'UREA',
};

export class SiemensAdapter implements VendorAdapter {
  readonly vendor = DeviceVendor.SIEMENS;
  private readonly generic = new GenericAdapter();

  mapToNormalized(parsed: ParsedProtocolPayload, context?: AdapterContext): NormalizedResult[] {
    const mergedContext: AdapterContext = {
      ...context,
      fieldMapping: { ...SIEMENS_TEST_MAP, ...context?.fieldMapping },
    };

    return this.generic.mapToNormalized(parsed, mergedContext).map((result) => ({
      ...result,
      parameterCode: SIEMENS_TEST_MAP[result.parameterCode] ?? result.parameterCode,
    }));
  }
}
