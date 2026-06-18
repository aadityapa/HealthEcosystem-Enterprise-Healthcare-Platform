import { NotFoundException } from '@nestjs/common';
import { DocumentStatus } from '@health/db';
import { DocumentsService } from './documents.service';

describe('DocumentsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    document: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: DocumentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DocumentsService(prisma as never);
  });

  it('creates document with generated document number', async () => {
    prisma.document.count.mockResolvedValue(0);
    prisma.document.create.mockResolvedValue({
      id: 'doc-1',
      documentNumber: 'DOC-000001',
      title: 'Lab Report',
    });

    const result = await service.create(ctx, { title: 'Lab Report' });

    expect(result.documentNumber).toBe('DOC-000001');
    expect(prisma.document.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: ctx.tenantId,
          createdBy: ctx.userId,
        }),
      }),
    );
  });

  it('uploads file with storage key stub', async () => {
    prisma.document.findFirst.mockResolvedValue({
      id: 'doc-1',
      documentNumber: 'DOC-000001',
      currentVersion: 1,
      mimeType: null,
      fileSize: null,
    });
    prisma.document.update.mockResolvedValue({
      id: 'doc-1',
      storageKey: 'dms/tenant-1/DOC-000001/v1',
    });

    const result = await service.upload(ctx, 'doc-1', {
      mimeType: 'application/pdf',
      fileSize: 1024,
    });

    expect(result.storageKey).toContain('DOC-000001');
  });

  it('soft-deletes document', async () => {
    prisma.document.findFirst.mockResolvedValue({ id: 'doc-1' });
    prisma.document.update.mockResolvedValue({
      id: 'doc-1',
      status: DocumentStatus.DELETED,
    });

    const result = await service.remove(ctx, 'doc-1');

    expect(result.status).toBe(DocumentStatus.DELETED);
  });

  it('throws NotFoundException when document is missing', async () => {
    prisma.document.findFirst.mockResolvedValue(null);

    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
