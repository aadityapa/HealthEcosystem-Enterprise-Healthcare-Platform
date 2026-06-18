import {
  ConnectionType,
  DeviceProtocol,
  DeviceStatus,
  DeviceVendor,
  MessageParseStatus,
  QueueItemStatus,
} from '@health/db';
import { InMemoryEventPublisher } from '@health/events';
import { ResultProcessorService } from './result-processor.service';
import { IntegrationEngineService } from '../engine/integration-engine.service';
import { ProtocolHandlerService } from '../protocols/protocol-handler.service';
import { AdapterRegistry } from '../adapters/adapter.registry';
import { ClinicalValidationEngineService } from '../validation/clinical-validation.service';

describe('ResultProcessorService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const device = {
    id: 'device-1',
    tenantId: ctx.tenantId,
    organizationId: ctx.organizationId,
    branchId: ctx.branchId,
    deviceCode: 'COBAS-01',
    name: 'Cobas 6000',
    vendor: DeviceVendor.ROCHE,
    protocol: DeviceProtocol.HL7_V2,
    connectionType: ConnectionType.MLLP,
    status: DeviceStatus.OFFLINE,
  };

  const hl7Payload = [
    'MSH|^~\\&|Cobas|Roche|LIMS|Lab|20260101120000||ORU^R01|MSG001|P|2.3',
    'OBR|1|SAMPLE001|SAMPLE001|CHEM',
    'OBX|1|NM|GLU||95|mg/dL',
  ].join('\r');

  function createService(overrides?: {
    sample?: { id: string; parameterId: string } | null;
    limsOk?: boolean;
  }) {
    const messages: unknown[] = [];
    const queueItems: unknown[] = [];

    const prisma = {
      deviceAdapter: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      deviceMessage: {
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({ id: 'msg-1', ...data }),
        ),
        update: jest.fn().mockResolvedValue({}),
      },
      device: {
        update: jest.fn().mockResolvedValue(device),
      },
      deviceEvent: {
        create: jest.fn().mockResolvedValue({}),
      },
      sample: {
        findFirst: jest.fn().mockResolvedValue(
          overrides?.sample
            ? {
                id: overrides.sample.id,
                barcode: 'SAMPLE001',
                labOrderItem: {
                  test: {
                    parameters: [{ id: overrides.sample.parameterId, code: 'GLUCOSE', name: 'Glucose' }],
                  },
                },
              }
            : null,
        ),
      },
      sampleResult: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      resultQueueItem: {
        create: jest.fn().mockImplementation(({ data }) => {
          const item = { id: 'queue-1', ...data };
          queueItems.push(item);
          return Promise.resolve(item);
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      deadLetterItem: {
        create: jest.fn().mockResolvedValue({ id: 'dlq-1' }),
      },
    };

    const eventPublisher = new InMemoryEventPublisher();
    const publishSpy = jest.spyOn(eventPublisher, 'publish');

    global.fetch = jest.fn().mockResolvedValue({
      ok: overrides?.limsOk !== false,
      status: 200,
      text: async () => '',
    }) as never;

    const service = new ResultProcessorService(
      prisma as never,
      eventPublisher,
      new IntegrationEngineService(new ProtocolHandlerService(), new AdapterRegistry()),
      new ClinicalValidationEngineService(),
      {
        push: jest.fn().mockResolvedValue('dlq-1'),
      } as never,
      {
        enqueue: jest.fn().mockResolvedValue(undefined),
      } as never,
      {
        trackMessage: jest.fn(),
        recordHealthSnapshot: jest.fn().mockResolvedValue({}),
      } as never,
      { get: jest.fn().mockReturnValue('http://localhost:3004') } as never,
    );

    return { service, prisma, publishSpy, queueItems };
  }

  it('processes ingestion and creates parsed message', async () => {
    const { service, prisma } = createService();
    const result = await service.processIngestion(ctx, device as never, hl7Payload);

    expect(result.messageId).toBe('msg-1');
    expect(result.resultsQueued).toBe(0);
    expect(prisma.deviceMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ parseStatus: MessageParseStatus.PARSING }),
      }),
    );
    expect(prisma.deviceMessage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ parseStatus: MessageParseStatus.PARSED }),
      }),
    );
  });

  it('queues and imports results when sample is matched', async () => {
    const { service, queueItems } = createService({
      sample: { id: 'sample-1', parameterId: 'param-1' },
    });

    const result = await service.processIngestion(ctx, device as never, hl7Payload);

    expect(result.resultsQueued).toBe(1);
    expect(result.resultsImported).toBe(1);
    expect(queueItems).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3004/api/v1/lims/samples/sample-1/results',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('pushes to DLQ and retry queue on parse failure', async () => {
    const { service, prisma } = createService();
    const deadLetter = { push: jest.fn().mockResolvedValue('dlq-1') };
    const retryQueue = { enqueue: jest.fn().mockResolvedValue(undefined) };

    const failingService = new ResultProcessorService(
      prisma as never,
      new InMemoryEventPublisher(),
      {
        process: jest.fn().mockImplementation(() => {
          throw new Error('Parse failed');
        }),
      } as never,
      new ClinicalValidationEngineService(),
      deadLetter as never,
      retryQueue as never,
      { trackMessage: jest.fn(), recordHealthSnapshot: jest.fn() } as never,
      { get: jest.fn() } as never,
    );

    await expect(
      failingService.processIngestion(ctx, device as never, 'bad payload'),
    ).rejects.toThrow('Parse failed');

    expect(deadLetter.push).toHaveBeenCalled();
    expect(retryQueue.enqueue).toHaveBeenCalled();
    expect(prisma.deviceMessage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ parseStatus: MessageParseStatus.FAILED }),
      }),
    );
  });

  it('marks queue item failed when LIMS import fails', async () => {
    const prisma = {
      deviceAdapter: { findFirst: jest.fn().mockResolvedValue(null) },
      deviceMessage: {
        create: jest.fn().mockResolvedValue({ id: 'msg-2' }),
        update: jest.fn().mockResolvedValue({}),
      },
      device: { update: jest.fn().mockResolvedValue(device) },
      deviceEvent: { create: jest.fn().mockResolvedValue({}) },
      sample: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'sample-2',
          barcode: 'SAMPLE001',
          labOrderItem: {
            test: { parameters: [{ id: 'param-2', code: 'GLUCOSE' }] },
          },
        }),
      },
      sampleResult: { findFirst: jest.fn().mockResolvedValue(null) },
      resultQueueItem: {
        create: jest.fn().mockResolvedValue({
          id: 'queue-2',
          sampleId: 'sample-2',
          parameterId: 'param-2',
          value: '95',
          unit: 'mg/dL',
          rawValue: null,
        }),
        update: jest.fn().mockResolvedValue({ status: QueueItemStatus.FAILED }),
      },
      deadLetterItem: { create: jest.fn() },
    };

    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'error' });

    const service = new ResultProcessorService(
      prisma as never,
      new InMemoryEventPublisher(),
      new IntegrationEngineService(new ProtocolHandlerService(), new AdapterRegistry()),
      new ClinicalValidationEngineService(),
      { push: jest.fn() } as never,
      { enqueue: jest.fn() } as never,
      { trackMessage: jest.fn(), recordHealthSnapshot: jest.fn() } as never,
      { get: jest.fn().mockReturnValue('http://localhost:3004') } as never,
    );

    const result = await service.processIngestion(ctx, device as never, hl7Payload);
    expect(result.resultsImported).toBe(0);
    expect(prisma.resultQueueItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: QueueItemStatus.FAILED }),
      }),
    );
  });
});
