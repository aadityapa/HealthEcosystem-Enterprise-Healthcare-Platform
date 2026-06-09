import { NotFoundException } from '@nestjs/common';
import { DocumentStatus } from '@health/db';
import { RetentionService } from './retention.service';

describe('RetentionService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    document: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: RetentionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RetentionService(prisma as never);
  });

  it('lists documents expiring within default 30 days', async () => {
    prisma.document.findMany.mockResolvedValue([{ id: 'doc-1' }]);

    const result = await service.getExpiring(ctx);

    expect(result).toHaveLength(1);
    expect(prisma.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          legalHold: false,
          retentionUntil: expect.objectContaining({ not: null }),
        }),
      }),
    );
  });

  it('applies legal hold and sets LEGAL_HOLD status', async () => {
    prisma.document.findFirst.mockResolvedValue({ id: 'doc-1' });
    prisma.document.update.mockResolvedValue({
      id: 'doc-1',
      legalHold: true,
      status: DocumentStatus.LEGAL_HOLD,
    });

    const result = await service.setLegalHold(ctx, 'doc-1', true);

    expect(result.status).toBe(DocumentStatus.LEGAL_HOLD);
    expect(result.legalHold).toBe(true);
  });

  it('releases legal hold and restores ACTIVE status', async () => {
    prisma.document.findFirst.mockResolvedValue({ id: 'doc-1' });
    prisma.document.update.mockResolvedValue({
      id: 'doc-1',
      legalHold: false,
      status: DocumentStatus.ACTIVE,
    });

    const result = await service.setLegalHold(ctx, 'doc-1', false);

    expect(result.status).toBe(DocumentStatus.ACTIVE);
  });

  it('throws NotFoundException when document is missing for legal hold', async () => {
    prisma.document.findFirst.mockResolvedValue(null);

    await expect(service.setLegalHold(ctx, 'missing', true)).rejects.toThrow(
      NotFoundException,
    );
  });
});
