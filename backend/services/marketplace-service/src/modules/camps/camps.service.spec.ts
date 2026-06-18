import { NotFoundException } from '@nestjs/common';
import { CampsService } from './camps.service';

describe('CampsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    campBooking: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  let service: CampsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CampsService(prisma as never);
  });

  it('creates camp booking', async () => {
    prisma.campBooking.count.mockResolvedValue(0);
    prisma.campBooking.create.mockResolvedValue({
      id: 'booking-1',
      bookingNumber: 'CAMP-000001',
    });

    const result = await service.createBooking(ctx, {
      campId: 'camp-1',
      name: 'John Doe',
    });

    expect(result.bookingNumber).toBe('CAMP-000001');
  });

  it('lists camp bookings', async () => {
    prisma.campBooking.findMany.mockResolvedValue([{ id: 'booking-1' }]);
    prisma.campBooking.count.mockResolvedValue(1);

    const result = await service.listBookings(ctx, { campId: 'camp-1' });
    expect(result.items).toHaveLength(1);
  });

  it('throws NotFoundException when booking missing', async () => {
    prisma.campBooking.findFirst.mockResolvedValue(null);
    await expect(service.getBooking(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
