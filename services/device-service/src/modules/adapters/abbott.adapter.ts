import { DeviceVendor } from '@health/db';
import { GenericAdapter } from './generic.adapter';
import type { VendorAdapter, AdapterContext } from './adapter.types';
import type { NormalizedResult, ParsedProtocolPayload } from '../protocols/protocol.types';

const ABBOTT_TEST_MAP: Record<string, string> = {
  '^^^GLU': 'GLUCOSE',
  '^^^CHOL': 'CHOLESTEROL',
  '^^^TRIG': 'TRIGLYCERIDES',
  GLU: 'GLUCOSE',
  CHOL: 'CHOLESTEROL',
};

export class AbbottAdapter implements VendorAdapter {
  readonly vendor = DeviceVendor.ABBOTT;
  private readonly generic = new GenericAdapter();

  mapToNormalized(parsed: ParsedProtocolPayload, context?: AdapterContext): NormalizedResult[] {
    const mergedContext: AdapterContext = {
      ...context,
      fieldMapping: { ...ABBOTT_TEST_MAP, ...context?.fieldMapping },
    };

    return this.generic.mapToNormalized(parsed, mergedContext).map((result) => ({
      ...result,
      parameterCode: ABBOTT_TEST_MAP[result.parameterCode] ?? result.parameterCode,
    }));
  }
}
