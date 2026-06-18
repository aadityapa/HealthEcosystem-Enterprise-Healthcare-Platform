import { BadRequestException } from '@nestjs/common';
import { SearchService } from './search.service';

describe('SearchService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    document: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  let service: SearchService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SearchService(prisma as never);
  });

  it('searches title and ocrText with case-insensitive match', async () => {
    prisma.document.findMany.mockResolvedValue([{ id: 'doc-1', title: 'Lab Report' }]);
    prisma.document.count.mockResolvedValue(1);

    const result = await service.search(ctx, 'lab report');

    expect(result.items).toHaveLength(1);
    expect(result.query).toBe('lab report');
    expect(prisma.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: 'lab report', mode: 'insensitive' } },
            { ocrText: { contains: 'lab report', mode: 'insensitive' } },
          ],
        }),
      }),
    );
  });

  it('rejects empty search query', async () => {
    await expect(service.search(ctx, '  ')).rejects.toThrow(BadRequestException);
  });
});
