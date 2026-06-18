import { NotFoundException } from '@nestjs/common';
import { MobileService } from './mobile.service';

describe('MobileService', () => {
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

  let service: MobileService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MobileService(prisma as never);
  });

  it('returns mobile app config', async () => {
    prisma.tenantBrand.findUnique.mockResolvedValue({
      mobileAppConfig: { splashColor: '#fff' },
    });
    const result = await service.getConfig(ctx, ctx.tenantId);
    expect(result.mobileAppConfig).toEqual({ splashColor: '#fff' });
  });

  it('updates mobile app config', async () => {
    prisma.tenantBrand.findUnique.mockResolvedValue({ tenantId: ctx.tenantId });
    prisma.tenantBrand.update.mockResolvedValue({
      mobileAppConfig: { appName: 'MyLab' },
    });
    const result = await service.updateConfig(ctx, ctx.tenantId, {
      mobileAppConfig: { appName: 'MyLab' },
    });
    expect(result.mobileAppConfig).toEqual({ appName: 'MyLab' });
  });
});
