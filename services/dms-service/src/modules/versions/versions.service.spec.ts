import { VersionsService } from './versions.service';
import { DocumentsService } from '@/modules/documents/documents.service';

describe('VersionsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    $transaction: jest.fn(),
    documentVersion: { create: jest.fn(), findMany: jest.fn() },
    document: { update: jest.fn() },
  };

  const documentsService = {
    getById: jest.fn(),
  };

  let service: VersionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new VersionsService(
      prisma as never,
      documentsService as unknown as DocumentsService,
    );
  });

  it('creates next document version and updates current version', async () => {
    documentsService.getById.mockResolvedValue({
      id: 'doc-1',
      currentVersion: 1,
      fileSize: BigInt(500),
    });
    prisma.$transaction.mockImplementation(async (ops: Promise<unknown>[]) => {
      const results = [];
      for (const op of ops) results.push(await op);
      return results;
    });
    prisma.documentVersion.create.mockResolvedValue({
      id: 'ver-2',
      version: 2,
      storageKey: 'dms/doc-1/v2',
    });
    prisma.document.update.mockResolvedValue({ id: 'doc-1', currentVersion: 2 });

    const result = await service.createVersion(ctx, 'doc-1', {
      storageKey: 'dms/doc-1/v2',
      changeNotes: 'Updated report',
    });

    expect(result.version).toBe(2);
    expect(prisma.documentVersion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ version: 2, uploadedBy: ctx.userId }),
      }),
    );
  });
});
