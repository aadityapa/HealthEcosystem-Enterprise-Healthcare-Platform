import { NotFoundException } from '@nestjs/common';
import { ResolveService } from './resolve.service';

describe('ResolveService', () => {
  const prisma = {
    tenantBrand: {
      findFirst: jest.fn(),
    },
  };

  let service: ResolveService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ResolveService(prisma as never);
  });

  it('resolves brand by custom domain', async () => {
    prisma.tenantBrand.findFirst.mockResolvedValue({
      tenantId: 'tenant-1',
      brandName: 'Acme Diagnostics',
      logoUrl: 'https://cdn.example.com/logo.png',
      faviconUrl: null,
      primaryColor: '#0055ff',
      secondaryColor: '#00aa88',
      themeConfig: {},
      mobileAppConfig: {},
      featureToggles: [{ featureKey: 'ai_chat', enabled: true }],
    });

    const result = await service.resolveByDomain('lab.acme.com');
    expect(result.brandName).toBe('Acme Diagnostics');
    expect(result.features).toHaveLength(1);
  });

  it('throws when domain not found', async () => {
    prisma.tenantBrand.findFirst.mockResolvedValue(null);
    await expect(service.resolveByDomain('unknown.com')).rejects.toThrow(NotFoundException);
  });
});
