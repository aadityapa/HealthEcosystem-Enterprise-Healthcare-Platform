import { ConflictException, NotFoundException } from '@nestjs/common';
import { TrainingService } from './training.service';

describe('TrainingService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    trainingCourse: { findMany: jest.fn(), findUnique: jest.fn() },
    trainingEnrollment: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: TrainingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TrainingService(prisma as never);
  });

  it('lists active courses', async () => {
    prisma.trainingCourse.findMany.mockResolvedValue([{ id: 'course-1', title: 'LIMS Basics' }]);
    const result = await service.listCourses();
    expect(result).toHaveLength(1);
  });

  it('enrolls user in course', async () => {
    prisma.trainingCourse.findUnique.mockResolvedValue({ id: 'course-1', isActive: true });
    prisma.trainingEnrollment.findUnique.mockResolvedValue(null);
    prisma.trainingEnrollment.create.mockResolvedValue({ id: 'enr-1', progressPct: 0 });

    const result = await service.enroll(ctx, { courseId: 'course-1' });
    expect(result.progressPct).toBe(0);
  });

  it('throws ConflictException on duplicate enrollment', async () => {
    prisma.trainingCourse.findUnique.mockResolvedValue({ id: 'course-1', isActive: true });
    prisma.trainingEnrollment.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(service.enroll(ctx, { courseId: 'course-1' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('throws NotFoundException when course missing', async () => {
    prisma.trainingCourse.findUnique.mockResolvedValue(null);
    await expect(service.enroll(ctx, { courseId: 'missing' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
