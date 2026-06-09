import { SignaturesService } from './signatures.service';
import { DocumentsService } from '@/modules/documents/documents.service';

describe('SignaturesService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    documentSignature: { create: jest.fn(), findMany: jest.fn() },
  };

  const documentsService = {
    getById: jest.fn(),
  };

  let service: SignaturesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SignaturesService(
      prisma as never,
      documentsService as unknown as DocumentsService,
    );
  });

  it('creates digital signature for document', async () => {
    documentsService.getById.mockResolvedValue({ id: 'doc-1' });
    prisma.documentSignature.create.mockResolvedValue({
      id: 'sig-1',
      signedBy: ctx.userId,
      signatureType: 'electronic',
    });

    const result = await service.sign(ctx, 'doc-1', {
      signedByName: 'Dr. Smith',
      signatureType: 'electronic',
      ipAddress: '127.0.0.1',
    });

    expect(result.signedBy).toBe(ctx.userId);
    expect(prisma.documentSignature.create).toHaveBeenCalled();
  });
});
