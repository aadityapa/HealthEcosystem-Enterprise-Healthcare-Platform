import { BadRequestException } from '@nestjs/common';
import { CollectionStatus } from '@health/db';
import { StopsService } from './stops.service';

describe('StopsService', () => {
  const ctx = {
    tenantId: '00000000-0000-4000-8000-000000000001',
    organizationId: '00000000-0000-4000-8000-000000000002',
    branchId: '00000000-0000-4000-8000-000000000003',
    userId: '00000000-0000-4000-8000-000000000004',
  };

  const prisma = {
    routeStop: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    fieldRoute: { findFirst: jest.fn(), update: jest.fn() },
    collectionProof: { upsert: jest.fn() },
  };

  let service: StopsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StopsService(prisma as never);
  });

  it('requires at least one proof type', async () => {
    prisma.routeStop.findFirst.mockResolvedValue({
      id: 'stop-1',
      routeId: 'route-1',
      route: { tenantId: ctx.tenantId },
    });

    await expect(service.submitProof(ctx, 'stop-1', {})).rejects.toThrow(
      BadRequestException,
    );
  });

  it('updates stop status to arrived', async () => {
    prisma.routeStop.findFirst.mockResolvedValue({
      id: 'stop-1',
      routeId: 'route-1',
      notes: null,
      route: { tenantId: ctx.tenantId },
    });
    prisma.routeStop.update.mockResolvedValue({
      id: 'stop-1',
      status: CollectionStatus.ARRIVED,
    });

    const result = await service.updateStatus(ctx, 'stop-1', {
      status: CollectionStatus.ARRIVED,
    });

    expect(result.status).toBe(CollectionStatus.ARRIVED);
  });
});
