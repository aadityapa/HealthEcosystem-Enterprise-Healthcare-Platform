import { DeviceVendor } from '@health/db';
import { GenericAdapter } from './generic.adapter';
import type { VendorAdapter, AdapterContext } from './adapter.types';
import type { NormalizedResult, ParsedProtocolPayload } from '../protocols/protocol.types';

const SYSMEX_TEST_MAP: Record<string, string> = {
  WBC: 'WHITE_BLOOD_CELL',
  RBC: 'RED_BLOOD_CELL',
  HGB: 'HEMOGLOBIN',
  HCT: 'HEMATOCRIT',
  PLT: 'PLATELET',
  MCV: 'MEAN_CORPUSCULAR_VOLUME',
};

export class SysmexAdapter implements VendorAdapter {
  readonly vendor = DeviceVendor.SYSMEX;
  private readonly generic = new GenericAdapter();

  mapToNormalized(parsed: ParsedProtocolPayload, context?: AdapterContext): NormalizedResult[] {
    const mergedContext: AdapterContext = {
      ...context,
      fieldMapping: { ...SYSMEX_TEST_MAP, ...context?.fieldMapping },
    };

    return this.generic.mapToNormalized(parsed, mergedContext).map((result) => ({
      ...result,
      parameterCode: SYSMEX_TEST_MAP[result.parameterCode] ?? result.parameterCode,
    }));
  }
}
