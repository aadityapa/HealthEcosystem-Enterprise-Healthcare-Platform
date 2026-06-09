import { OcrService } from './ocr.service';
import { DocumentsService } from '@/modules/documents/documents.service';

describe('OcrService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    document: { update: jest.fn() },
  };

  const documentsService = {
    getById: jest.fn(),
  };

  let service: OcrService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OcrService(prisma as never, documentsService as unknown as DocumentsService);
  });

  it('extracts OCR text via stub and stores on document', async () => {
    documentsService.getById.mockResolvedValue({
      id: 'doc-1',
      title: 'Pathology Report',
      storageKey: 'dms/tenant-1/DOC-000001/v1',
    });
    prisma.document.update.mockResolvedValue({
      id: 'doc-1',
      ocrText: 'OCR extracted text for "Pathology Report"',
    });

    const result = await service.extractText(ctx, 'doc-1');

    expect(result.ocrText).toContain('Pathology Report');
    expect(prisma.document.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'doc-1' },
        data: expect.objectContaining({ ocrText: expect.stringContaining('Pathology Report') }),
      }),
    );
  });
});
