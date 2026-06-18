import { ConflictException, NotFoundException } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

describe('KnowledgeService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    knowledgeArticle: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: KnowledgeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new KnowledgeService(prisma as never);
  });

  it('creates knowledge article', async () => {
    prisma.knowledgeArticle.findUnique.mockResolvedValue(null);
    prisma.knowledgeArticle.create.mockResolvedValue({ id: 'art-1', slug: 'getting-started' });

    const result = await service.create(ctx, {
      slug: 'getting-started',
      title: 'Getting Started',
      category: 'onboarding',
      content: 'Welcome',
    });
    expect(result.slug).toBe('getting-started');
  });

  it('throws ConflictException on duplicate slug', async () => {
    prisma.knowledgeArticle.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create(ctx, {
        slug: 'dup',
        title: 'Dup',
        category: 'general',
        content: 'x',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when article missing', async () => {
    prisma.knowledgeArticle.findUnique.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
