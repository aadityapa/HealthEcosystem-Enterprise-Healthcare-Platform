import { DeviceProtocol, DeviceVendor } from '@health/db';
import { IntegrationEngineService } from './integration-engine.service';
import { ProtocolHandlerService } from '../protocols/protocol-handler.service';
import { AdapterRegistry } from '../adapters/adapter.registry';

describe('IntegrationEngineService', () => {
  let service: IntegrationEngineService;

  const hl7Payload = [
    'MSH|^~\\&|Sysmex|XN|LIMS|Lab|20260101120000||ORU^R01|MSG100|P|2.3',
    'OBR|1|BC001|BC001|CBC',
    'OBX|1|NM|WBC||7.5|10*3/uL|4.0-11.0|N',
    'OBX|2|NM|RBC||4.8|10*6/uL|4.5-5.5|N',
  ].join('\r');

  const device = {
    id: 'dev-1',
    vendor: DeviceVendor.SYSMEX,
    protocol: DeviceProtocol.HL7_V2,
  } as never;

  beforeEach(() => {
    service = new IntegrationEngineService(
      new ProtocolHandlerService(),
      new AdapterRegistry(),
    );
  });

  it('parses, normalizes, and deduplicates HL7 results', () => {
    const result = service.process(device, hl7Payload);
    expect(result.parsed.protocol).toBe('HL7_V2');
    expect(result.sampleBarcode).toBe('BC001');
    expect(result.deduplicated.length).toBe(2);
    expect(result.deduplicated[0].parameterCode).toBe('WHITE_BLOOD_CELL');
  });

  it('deduplicates identical results', () => {
    const duplicatePayload = [
      'MSH|^~\\&|Roche|Cobas|LIMS|Lab|20260101120000||ORU^R01|MSG101|P|2.3',
      'OBR|1|BC002|BC002|CHEM',
      'OBX|1|NM|GLU||95|mg/dL',
      'OBX|2|NM|GLU||95|mg/dL',
    ].join('\r');

    const rocheDevice = {
      id: 'dev-1',
      vendor: DeviceVendor.ROCHE,
      protocol: DeviceProtocol.HL7_V2,
    } as never;

    const result = service.process(rocheDevice, duplicatePayload);
    expect(result.deduplicated).toHaveLength(1);
    expect(result.deduplicated[0].parameterCode).toBe('GLUCOSE');
  });

  it('processes ASTM for Abbott adapter', () => {
    const astmPayload = [
      'H|\\^&|||Architect^Abbott',
      'O|1|ABT001||^^^GLU',
      'R|1|^^^GLU|110|mg/dL',
      'L|1|N',
    ].join('\r');

    const abbottDevice = {
      id: 'dev-2',
      vendor: DeviceVendor.ABBOTT,
      protocol: DeviceProtocol.ASTM,
    } as never;

    const result = service.process(abbottDevice, astmPayload);
    expect(result.sampleBarcode).toBe('ABT001');
    expect(result.deduplicated[0].parameterCode).toBe('GLUCOSE');
  });
});
