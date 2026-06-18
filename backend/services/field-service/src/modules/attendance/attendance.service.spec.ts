import { BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
  const ctx = {
    tenantId: '00000000-0000-4000-8000-000000000001',
    organizationId: '00000000-0000-4000-8000-000000000002',
    branchId: '00000000-0000-4000-8000-000000000003',
    userId: '00000000-0000-4000-8000-000000000004',
  };

  const prisma = {
    phlebotomist: { findFirst: jest.fn() },
    fieldAttendance: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    geoFence: { findMany: jest.fn() },
  };

  let service: AttendanceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AttendanceService(prisma as never);
  });

  it('checks in with geofence validation', async () => {
    prisma.phlebotomist.findFirst.mockResolvedValue({ id: 'phleb-1' });
    prisma.fieldAttendance.findFirst.mockResolvedValue(null);
    prisma.geoFence.findMany.mockResolvedValue([
      { centerLat: 19.076, centerLng: 72.8777, radiusMeters: 500 },
    ]);
    prisma.fieldAttendance.create.mockResolvedValue({
      id: 'att-1',
      withinGeofence: true,
    });

    const result = await service.checkIn(ctx, {
      phlebotomistId: 'phleb-1',
      lat: 19.076,
      lng: 72.8777,
    });

    expect(result.withinGeofence).toBe(true);
  });

  it('rejects check-out without active session', async () => {
    prisma.fieldAttendance.findFirst.mockResolvedValue(null);

    await expect(
      service.checkOut(ctx, { phlebotomistId: 'phleb-1' }),
    ).rejects.toThrow(BadRequestException);
  });
});
