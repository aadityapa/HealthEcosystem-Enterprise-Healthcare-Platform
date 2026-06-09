import { NotFoundException } from '@nestjs/common';
import { MaterialsService } from './materials.service';

describe('MaterialsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    qcMaterial: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: MaterialsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MaterialsService(prisma as never);
  });

  it('creates a QC material with tenant context', async () => {
    const dto = {
      code: 'QC-L1',
      name: 'Level 1 Glucose',
      analyte: 'GLU',
      level: 'L1',
      targetMean: 100,
      targetSd: 5,
    };
    prisma.qcMaterial.create.mockResolvedValue({ id: 'mat-1', ...dto });

    const result = await service.create(ctx, dto);

    expect(prisma.qcMaterial.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: ctx.tenantId,
        code: 'QC-L1',
        targetMean: 100,
      }),
    });
    expect(result.id).toBe('mat-1');
  });

  it('throws NotFoundException when material is missing', async () => {
    prisma.qcMaterial.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
