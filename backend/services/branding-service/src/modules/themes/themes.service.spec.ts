import { NotFoundException } from '@nestjs/common';
import { ThemesService } from './themes.service';

describe('ThemesService', () => {
  const ctx = {
    tenantId: '11111111-1111-1111-1111-111111111111',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    tenantBrand: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: ThemesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ThemesService(prisma as never);
  });

  it('returns theme config for tenant', async () => {
    prisma.tenantBrand.findUnique.mockResolvedValue({
      themeConfig: { fontFamily: 'Inter' },
    });

    const result = await service.getTheme(ctx, ctx.tenantId);
    expect(result.themeConfig).toEqual({ fontFamily: 'Inter' });
  });

  it('updates theme config', async () => {
    prisma.tenantBrand.findUnique.mockResolvedValue({ tenantId: ctx.tenantId });
    prisma.tenantBrand.update.mockResolvedValue({
      themeConfig: { primary: '#0055ff' },
    });

    const result = await service.updateTheme(ctx, ctx.tenantId, {
      themeConfig: { primary: '#0055ff' },
    });
    expect(result.themeConfig).toEqual({ primary: '#0055ff' });
  });

  it('throws when tenant mismatch', async () => {
    await expect(service.getTheme(ctx, '22222222-2222-2222-2222-222222222222')).rejects.toThrow(
      NotFoundException,
    );
  });
});
