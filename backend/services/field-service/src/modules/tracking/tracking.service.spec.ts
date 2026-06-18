import { NotFoundException } from '@nestjs/common';
import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  const ctx = {
    tenantId: '00000000-0000-4000-8000-000000000001',
    organizationId: '00000000-0000-4000-8000-000000000002',
    branchId: '00000000-0000-4000-8000-000000000003',
    userId: '00000000-0000-4000-8000-000000000004',
  };

  const prisma = {
    phlebotomist: { findFirst: jest.fn(), update: jest.fn() },
    gpsPing: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  };

  let service: TrackingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TrackingService(prisma as never);
  });

  it('records GPS ping and updates phlebotomist location', async () => {
    prisma.phlebotomist.findFirst.mockResolvedValue({ id: 'phleb-1' });
    prisma.gpsPing.create.mockResolvedValue({ id: 'ping-1', lat: 19.076, lng: 72.8777 });
    prisma.phlebotomist.update.mockResolvedValue({});

    const result = await service.recordPing(ctx, {
      phlebotomistId: 'phleb-1',
      lat: 19.076,
      lng: 72.8777,
    });

    expect(result.id).toBe('ping-1');
    expect(prisma.phlebotomist.update).toHaveBeenCalled();
  });

  it('throws when phlebotomist not found', async () => {
    prisma.phlebotomist.findFirst.mockResolvedValue(null);

    await expect(
      service.recordPing(ctx, { phlebotomistId: 'missing', lat: 19, lng: 72 }),
    ).rejects.toThrow(NotFoundException);
  });
});
