import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';

@Injectable()
export class ResolveService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async resolveByDomain(domain: string) {
    const brand = await this.prisma.tenantBrand.findFirst({
      where: {
        customDomain: domain,
        isActive: true,
      },
      include: {
        featureToggles: true,
      },
    });

    if (!brand) {
      throw new NotFoundException(`No brand found for domain: ${domain}`);
    }

    return {
      tenantId: brand.tenantId,
      brandName: brand.brandName,
      logoUrl: brand.logoUrl,
      faviconUrl: brand.faviconUrl,
      primaryColor: brand.primaryColor,
      secondaryColor: brand.secondaryColor,
      themeConfig: brand.themeConfig,
      mobileAppConfig: brand.mobileAppConfig,
      features: brand.featureToggles,
    };
  }
}
