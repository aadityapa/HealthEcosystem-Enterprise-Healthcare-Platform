import type { DeviceVendor } from '@health/db';
import type { NormalizedResult, ParsedProtocolPayload } from '../protocols/protocol.types';

export interface AdapterContext {
  fieldMapping?: Record<string, string>;
  transformationRules?: Record<string, unknown>;
}

export interface VendorAdapter {
  readonly vendor: DeviceVendor;
  mapToNormalized(
    parsed: ParsedProtocolPayload,
    context?: AdapterContext,
  ): NormalizedResult[];
}
