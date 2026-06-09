import { DeviceProtocol, DeviceVendor } from '@health/db';
import { InMemoryEventPublisher } from '@health/events';
import { ProtocolHandlerService } from './modules/protocols/protocol-handler.service';
import { AdapterRegistry } from './modules/adapters/adapter.registry';
import { IntegrationEngineService } from './modules/engine/integration-engine.service';
import { ClinicalValidationEngineService } from './modules/validation/clinical-validation.service';
import { ResultProcessorService } from './modules/processor/result-processor.service';

describe('Device ingestion pipeline (integration)', () => {
  const ctx = {
    tenantId: '00000000-0000-4000-8000-000000000001',
    organizationId: '00000000-0000-4000-8000-000000000002',
    branchId: '00000000-0000-4000-8000-000000000003',
    userId: '00000000-0000-4000-8000-000000000004',
  };

  const hl7Message = [
    'MSH|^~\\&|Cobas|Roche|LIMS|Lab|20260101120000||ORU^R01|PIPE001|P|2.3',
    'OBR|1|BARCODE123|BARCODE123|CHEM',
    'OBX|1|NM|GLU||88|mg/dL|70-110|N',
    'OBX|2|NM|CREA||0.9|mg/dL|0.6-1.2|N',
  ].join('\r');

  const device = {
    id: '00000000-0000-4000-8000-000000000010',
    tenantId: ctx.tenantId,
    organizationId: ctx.organizationId,
    branchId: ctx.branchId,
    deviceCode: 'ROCHE-01',
    name: 'Cobas 6000',
    vendor: DeviceVendor.ROCHE,
    protocol: DeviceProtocol.HL7_V2,
    status: 'OFFLINE',
  };

  it('runs full pipeline: protocol → engine → validation → LIMS', async () => {
    const events: string[] = [];
    const eventPublisher = new InMemoryEventPublisher();
    eventPublisher.on('device.message.received', async () => { events.push('received'); });
    eventPublisher.on('device.result_parsed', async () => { events.push('parsed'); });
    eventPublisher.on('device.result.imported', async () => { events.push('imported'); });

    const prisma = {
      deviceAdapter: { findFirst: jest.fn().mockResolvedValue(null) },
      deviceMessage: {
        create: jest.fn().mockResolvedValue({ id: 'msg-pipe-1' }),
        update: jest.fn().mockResolvedValue({}),
      },
      device: { update: jest.fn().mockResolvedValue(device) },
      deviceEvent: { create: jest.fn().mockResolvedValue({}) },
      sample: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'sample-pipe-1',
          barcode: 'BARCODE123',
          labOrderItem: {
            test: {
              parameters: [
                { id: 'p-glu', code: 'GLUCOSE', name: 'Glucose' },
                { id: 'p-crea', code: 'CREATININE', name: 'Creatinine' },
              ],
            },
          },
        }),
      },
      sampleResult: { findFirst: jest.fn().mockResolvedValue(null) },
      resultQueueItem: {
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({ id: `q-${data.parameterCode}`, ...data }),
        ),
        update: jest.fn().mockResolvedValue({}),
      },
      deadLetterItem: { create: jest.fn() },
    };

    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, text: async () => '{}' });

    const processor = new ResultProcessorService(
      prisma as never,
      eventPublisher,
      new IntegrationEngineService(new ProtocolHandlerService(), new AdapterRegistry()),
      new ClinicalValidationEngineService(),
      { push: jest.fn() } as never,
      { enqueue: jest.fn() } as never,
      { trackMessage: jest.fn(), recordHealthSnapshot: jest.fn().mockResolvedValue({}) } as never,
      { get: jest.fn().mockReturnValue('http://localhost:3004') } as never,
    );

    const result = await processor.processIngestion(ctx, device as never, hl7Message);

    expect(result.resultsQueued).toBe(2);
    expect(result.resultsImported).toBe(2);
    expect(prisma.deviceMessage.update).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(events).toContain('received');
    expect(events).toContain('parsed');
    expect(events).toContain('imported');
  });

  it('protocol handler routes ASTM correctly through engine', () => {
    const astm = [
      'H|\\^&|||AU5800',
      'O|1|ASTM001||^^^GLU',
      'R|1|^^^GLU|99|mg/dL',
      'L|1|N',
    ].join('\r');

    const engine = new IntegrationEngineService(
      new ProtocolHandlerService(),
      new AdapterRegistry(),
    );

    const result = engine.process(
      {
        id: 'd-astm',
        vendor: DeviceVendor.BECKMAN_COULTER,
        protocol: DeviceProtocol.ASTM,
      } as never,
      astm,
    );

    expect(result.sampleBarcode).toBe('ASTM001');
    expect(result.deduplicated[0].parameterCode).toBe('GLUCOSE');
    expect(result.deduplicated[0].value).toBe('99');
  });
});
