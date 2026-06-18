import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { PRISMA } from '@/database/database.module';

describe('DoctorsService', () => {
  let service: DoctorsService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      ehrDoctor: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DoctorsService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get<DoctorsService>(DoctorsService);
  });

  it('creates doctor when code is available', async () => {
    prisma.ehrDoctor.findFirst.mockResolvedValue(null);
    prisma.ehrDoctor.create.mockResolvedValue({ id: 'doc-1', code: 'DR01', name: 'Dr Smith' });

    const result = await service.create(ctx, { code: 'DR01', name: 'Dr Smith' });

    expect(result.code).toBe('DR01');
  });

  it('throws ConflictException when doctor code exists', async () => {
    prisma.ehrDoctor.findFirst.mockResolvedValue({ id: 'doc-1' });

    await expect(
      service.create(ctx, { code: 'DR01', name: 'Dr Smith' }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when doctor is missing', async () => {
    prisma.ehrDoctor.findFirst.mockResolvedValue(null);

    await expect(service.get(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });

  it('returns paginated doctor list', async () => {
    prisma.ehrDoctor.findMany.mockResolvedValue([{ id: 'doc-1' }]);
    prisma.ehrDoctor.count.mockResolvedValue(1);

    const result = await service.list(ctx, { page: 1, limit: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });
});
