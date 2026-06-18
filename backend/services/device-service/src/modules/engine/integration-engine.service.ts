import { Injectable } from '@nestjs/common';
import type { Device, DeviceAdapter } from '@health/db';
import { AdapterRegistry } from '../adapters/adapter.registry';
import { ProtocolHandlerService } from '../protocols/protocol-handler.service';
import type { NormalizedResult, ParsedProtocolPayload } from '../protocols/protocol.types';
import type { AdapterContext } from '../adapters/adapter.types';

export interface IntegrationResult {
  parsed: ParsedProtocolPayload;
  normalized: NormalizedResult[];
  deduplicated: NormalizedResult[];
  sampleBarcode?: string;
  messageControlId?: string;
  checksumValid?: boolean;
}

@Injectable()
export class IntegrationEngineService {
  constructor(
    private readonly protocolHandler: ProtocolHandlerService,
    private readonly adapterRegistry: AdapterRegistry,
  ) {}

  process(
    device: Device,
    rawPayload: string,
    adapterConfig?: DeviceAdapter | null,
  ): IntegrationResult {
    const parsed = this.protocolHandler.parse(device.protocol, rawPayload);

    const context: AdapterContext = {
      fieldMapping: (adapterConfig?.fieldMapping as Record<string, string>) ?? {},
      transformationRules:
        (adapterConfig?.transformationRules as Record<string, unknown>) ?? {},
    };

    const vendorAdapter = this.adapterRegistry.getAdapter(device.vendor);
    const normalized = vendorAdapter
      .mapToNormalized(parsed, context)
      .filter((r) => r.sampleBarcode && r.parameterCode && r.value);

    const deduplicated = this.deduplicate(normalized);

    const sampleBarcode = this.extractSampleBarcode(parsed, deduplicated);
    const messageControlId = this.extractMessageControlId(parsed);
    const checksumValid =
      parsed.protocol === 'ASTM' ? parsed.data.checksumValid : undefined;

    return {
      parsed,
      normalized,
      deduplicated,
      sampleBarcode,
      messageControlId,
      checksumValid,
    };
  }

  private deduplicate(results: NormalizedResult[]): NormalizedResult[] {
    const seen = new Map<string, NormalizedResult>();

    for (const result of results) {
      const key = `${result.sampleBarcode}|${result.parameterCode}|${result.value}`;
      if (!seen.has(key)) {
        seen.set(key, result);
      }
    }

    return Array.from(seen.values());
  }

  private extractSampleBarcode(
    parsed: ParsedProtocolPayload,
    results: NormalizedResult[],
  ): string | undefined {
    if (parsed.protocol === 'ASTM') return parsed.data.sampleBarcode;
    if (parsed.protocol === 'HL7_V2') return parsed.data.sampleBarcode;
    if (parsed.protocol === 'FHIR') return parsed.data.sampleBarcode;
    if (parsed.protocol === 'DICOM') {
      return parsed.data.accessionNumber ?? parsed.data.patientId;
    }
    return results[0]?.sampleBarcode;
  }

  private extractMessageControlId(parsed: ParsedProtocolPayload): string | undefined {
    if (parsed.protocol === 'ASTM') return parsed.data.messageControlId;
    if (parsed.protocol === 'HL7_V2') return parsed.data.messageControlId;
    return undefined;
  }
}
