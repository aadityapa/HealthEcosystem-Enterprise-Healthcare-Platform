import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TracesService } from './traces.service';
import { OtelCollectorService } from '@/services/otel-collector.service';
import { PRISMA } from '@/database/database.module';

describe('TracesService', () => {
  let service: TracesService;
  let prisma: { traceSpan: { findMany: jest.Mock } };
  let otelCollector: { ingestSpans: jest.Mock };

  beforeEach(async () => {
    prisma = { traceSpan: { findMany: jest.fn() } };
    otelCollector = { ingestSpans: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TracesService,
        { provide: PRISMA, useValue: prisma },
        { provide: OtelCollectorService, useValue: otelCollector },
      ],
    }).compile();

    service = module.get(TracesService);
  });

  it('delegates span ingestion to otel collector', async () => {
    otelCollector.ingestSpans.mockResolvedValue({ accepted: 1, traceIds: ['t1'] });

    const result = await service.ingestSpans({
      spans: [
        {
          traceId: 't1',
          spanId: 's1',
          serviceName: 'lims-service',
          operationName: 'op',
          durationMs: 10,
          startedAt: '2025-06-01T00:00:00.000Z',
        },
      ],
    });

    expect(result.accepted).toBe(1);
    expect(otelCollector.ingestSpans).toHaveBeenCalled();
  });

  it('returns trace with spans', async () => {
    prisma.traceSpan.findMany.mockResolvedValue([{ spanId: 's1' }]);

    const result = await service.getTrace('trace-1');

    expect(result.traceId).toBe('trace-1');
    expect(result.spans).toHaveLength(1);
  });

  it('throws when trace not found', async () => {
    prisma.traceSpan.findMany.mockResolvedValue([]);

    await expect(service.getTrace('missing')).rejects.toThrow(NotFoundException);
  });
});
