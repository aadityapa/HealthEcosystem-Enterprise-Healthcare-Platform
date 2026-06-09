import { BadRequestException } from '@nestjs/common';
import { RouteStatus } from '@health/db';
import { RoutesService } from './routes.service';
import { RouteOptimizerService } from '@/services/route-optimizer.service';

describe('RoutesService', () => {
  const ctx = {
    tenantId: '00000000-0000-4000-8000-000000000001',
    organizationId: '00000000-0000-4000-8000-000000000002',
    branchId: '00000000-0000-4000-8000-000000000003',
    userId: '00000000-0000-4000-8000-000000000004',
  };

  const prisma = {
    fieldRoute: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    phlebotomist: { findFirst: jest.fn() },
    routeStop: { update: jest.fn() },
  };

  const routeOptimizer = new RouteOptimizerService();
  let service: RoutesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RoutesService(prisma as never, routeOptimizer);
  });

  it('starts a planned route', async () => {
    prisma.fieldRoute.findFirst.mockResolvedValue({
      id: 'route-1',
      status: RouteStatus.PLANNED,
      tenantId: ctx.tenantId,
      stops: [],
    });
    prisma.fieldRoute.update.mockResolvedValue({
      id: 'route-1',
      status: RouteStatus.IN_PROGRESS,
    });

    const result = await service.start(ctx, 'route-1');
    expect(result.status).toBe(RouteStatus.IN_PROGRESS);
  });

  it('rejects starting a non-planned route', async () => {
    prisma.fieldRoute.findFirst.mockResolvedValue({
      id: 'route-1',
      status: RouteStatus.IN_PROGRESS,
      tenantId: ctx.tenantId,
      stops: [],
    });

    await expect(service.start(ctx, 'route-1')).rejects.toThrow(BadRequestException);
  });

  it('optimizes stop order for planned route', async () => {
    prisma.fieldRoute.findFirst.mockResolvedValue({
      id: 'route-1',
      status: RouteStatus.PLANNED,
      tenantId: ctx.tenantId,
      stops: [
        { id: 's1', lat: 19.08, lng: 72.88 },
        { id: 's2', lat: 19.2, lng: 73.0 },
      ],
    });
    prisma.routeStop.update.mockResolvedValue({});
    prisma.fieldRoute.update.mockResolvedValue({
      id: 'route-1',
      optimizedOrder: ['s1', 's2'],
    });

    const result = await service.optimize(ctx, 'route-1', { startLat: 19.076, startLng: 72.8777 });
    expect(prisma.routeStop.update).toHaveBeenCalledTimes(2);
    expect(result.optimizedOrder).toBeDefined();
  });
});
