import { DeviceVendor } from '@health/db';
import { GenericAdapter } from './generic.adapter';
import type { VendorAdapter, AdapterContext } from './adapter.types';
import type { NormalizedResult, ParsedProtocolPayload } from '../protocols/protocol.types';

const BECKMAN_TEST_MAP: Record<string, string> = {
  '^^^GLU': 'GLUCOSE',
  '^^^BUN': 'UREA',
  '^^^CREA': 'CREATININE',
  GLU: 'GLUCOSE',
  BUN: 'UREA',
  CREA: 'CREATININE',
};

export class BeckmanAdapter implements VendorAdapter {
  readonly vendor = DeviceVendor.BECKMAN_COULTER;
  private readonly generic = new GenericAdapter();

  mapToNormalized(parsed: ParsedProtocolPayload, context?: AdapterContext): NormalizedResult[] {
    const mergedContext: AdapterContext = {
      ...context,
      fieldMapping: { ...BECKMAN_TEST_MAP, ...context?.fieldMapping },
    };

    return this.generic.mapToNormalized(parsed, mergedContext).map((result) => ({
      ...result,
      parameterCode: BECKMAN_TEST_MAP[result.parameterCode] ?? result.parameterCode,
    }));
  }
}
