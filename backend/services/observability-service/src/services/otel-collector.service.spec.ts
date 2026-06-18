import { Test, TestingModule } from '@nestjs/testing';
import { OtelCollectorService } from './otel-collector.service';
import { PRISMA } from '@/database/database.module';

describe('OtelCollectorService', () => {
  let service: OtelCollectorService;
  let prisma: { traceSpan: { createMany: jest.Mock } };

  beforeEach(async () => {
    prisma = { traceSpan: { createMany: jest.fn().mockResolvedValue({ count: 2 }) } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtelCollectorService,
        { provide: PRISMA, useValue: prisma },
      ],
    }).compile();

    service = module.get(OtelCollectorService);
  });

  it('returns zero accepted for empty batch', async () => {
    const result = await service.ingestSpans([]);
    expect(result.accepted).toBe(0);
    expect(result.traceIds).toEqual([]);
    expect(prisma.traceSpan.createMany).not.toHaveBeenCalled();
  });

  it('stores span batch and returns trace IDs', async () => {
    const result = await service.ingestSpans([
      {
        traceId: 'trace-1',
        spanId: 'span-1',
        serviceName: 'lims-service',
        operationName: 'GET /samples',
        durationMs: 42,
        startedAt: '2025-06-01T10:00:00.000Z',
      },
      {
        traceId: 'trace-1',
        spanId: 'span-2',
        parentSpanId: 'span-1',
        serviceName: 'patient-service',
        operationName: 'GET /patients',
        durationMs: 15,
        status: 'error',
        startedAt: '2025-06-01T10:00:00.010Z',
      },
    ]);

    expect(result.accepted).toBe(2);
    expect(result.traceIds).toEqual(['trace-1']);
    expect(prisma.traceSpan.createMany).toHaveBeenCalledWith(
      expect.objectContaining({ skipDuplicates: true }),
    );
  });

  it('defaults span status to ok', async () => {
    await service.ingestSpans([
      {
        traceId: 'trace-2',
        spanId: 'span-1',
        serviceName: 'billing-service',
        operationName: 'POST /invoices',
        durationMs: 100,
        startedAt: '2025-06-01T10:00:00.000Z',
      },
    ]);

    expect(prisma.traceSpan.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [expect.objectContaining({ status: 'ok' })],
      }),
    );
  });
});
