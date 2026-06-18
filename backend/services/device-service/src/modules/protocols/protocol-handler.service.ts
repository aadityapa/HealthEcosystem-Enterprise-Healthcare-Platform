import { Injectable, BadRequestException } from '@nestjs/common';
import { DeviceProtocol } from '@health/db';
import { parseAstmMessage } from './astm.parser';
import { parseHl7Message } from './hl7.parser';
import { parseFhirBundle } from './fhir.parser';
import { parseDicomMetadata } from './dicom.parser';
import type { ParsedProtocolPayload } from './protocol.types';

@Injectable()
export class ProtocolHandlerService {
  parse(protocol: DeviceProtocol, rawPayload: string): ParsedProtocolPayload {
    switch (protocol) {
      case DeviceProtocol.ASTM:
        return { protocol: 'ASTM', data: parseAstmMessage(rawPayload) };
      case DeviceProtocol.HL7_V2:
        return { protocol: 'HL7_V2', data: parseHl7Message(rawPayload) };
      case DeviceProtocol.FHIR:
        return { protocol: 'FHIR', data: parseFhirBundle(rawPayload) };
      case DeviceProtocol.DICOM:
        return { protocol: 'DICOM', data: parseDicomMetadata(rawPayload) };
      default:
        throw new BadRequestException(`Unsupported protocol: ${protocol}`);
    }
  }
}
