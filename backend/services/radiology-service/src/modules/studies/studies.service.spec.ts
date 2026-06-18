import { ConflictException, NotFoundException } from '@nestjs/common';
import { ModalityType, StudyStatus } from '@health/db';
import { StudiesService } from './studies.service';

describe('StudiesService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    radiologyStudy: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: StudiesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StudiesService(prisma as never);
  });

  it('creates a study', async () => {
    prisma.radiologyStudy.findFirst.mockResolvedValue(null);
    prisma.radiologyStudy.create.mockResolvedValue({
      id: 'study-1',
      status: StudyStatus.SCHEDULED,
    });

    const result = await service.create(ctx, {
      patientId: 'pat-1',
      studyUid: '1.2.3',
      accessionNumber: 'ACC-001',
      modality: ModalityType.CT,
    });

    expect(result.status).toBe(StudyStatus.SCHEDULED);
  });

  it('throws ConflictException on duplicate study', async () => {
    prisma.radiologyStudy.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create(ctx, {
        patientId: 'pat-1',
        studyUid: '1.2.3',
        accessionNumber: 'ACC-001',
        modality: ModalityType.CT,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('performs study', async () => {
    prisma.radiologyStudy.findFirst.mockResolvedValue({
      id: 'study-1',
      status: StudyStatus.SCHEDULED,
    });
    prisma.radiologyStudy.update.mockResolvedValue({
      id: 'study-1',
      status: StudyStatus.IN_PROGRESS,
    });

    const result = await service.perform(ctx, 'study-1');
    expect(result.status).toBe(StudyStatus.IN_PROGRESS);
  });

  it('completes in-progress study', async () => {
    prisma.radiologyStudy.findFirst.mockResolvedValue({
      id: 'study-1',
      status: StudyStatus.IN_PROGRESS,
    });
    prisma.radiologyStudy.update.mockResolvedValue({
      id: 'study-1',
      status: StudyStatus.COMPLETED,
    });

    const result = await service.complete(ctx, 'study-1');
    expect(result.status).toBe(StudyStatus.COMPLETED);
  });

  it('throws NotFoundException when study missing', async () => {
    prisma.radiologyStudy.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
