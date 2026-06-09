import { Test, TestingModule } from '@nestjs/testing';
import { ServiceMapService } from './service-map.service';
import { PRISMA } from '@/database/database.module';

describe('ServiceMapService', () => {
  let service: ServiceMapService;
  let prisma: { traceSpan: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = { traceSpan: { findMany: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceMapService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(ServiceMapService);
  });

  it('builds empty graph when no spans exist', async () => {
    prisma.traceSpan.findMany.mockResolvedValue([]);

    const graph = await service.buildGraph();

    expect(graph.nodes).toEqual([]);
    expect(graph.edges).toEqual([]);
  });

  it('derives nodes and cross-service edges from spans', async () => {
    prisma.traceSpan.findMany.mockResolvedValue([
      { traceId: 't1', spanId: 's1', parentSpanId: null, serviceName: 'gateway' },
      { traceId: 't1', spanId: 's2', parentSpanId: 's1', serviceName: 'lims-service' },
      { traceId: 't1', spanId: 's3', parentSpanId: 's2', serviceName: 'patient-service' },
    ]);

    const graph = await service.buildGraph(12);

    expect(graph.nodes).toHaveLength(3);
    expect(graph.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: 'gateway', target: 'lims-service' }),
        expect.objectContaining({ source: 'lims-service', target: 'patient-service' }),
      ]),
    );
  });
});
