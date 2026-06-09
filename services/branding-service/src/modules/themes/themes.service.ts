import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { UpdateThemeDto } from './dto/themes.dto';

@Injectable()
export class ThemesService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  private async findBrand(tenantId: string) {
    const brand = await this.prisma.tenantBrand.findUnique({ where: { tenantId } });
    if (!brand) throw new NotFoundException('Brand not found for tenant');
    return brand;
  }

  async getTheme(ctx: ServiceRequestContext, tenantId: string) {
    if (tenantId !== ctx.tenantId) {
      throw new NotFoundException('Brand not found for tenant');
    }
    const brand = await this.findBrand(tenantId);
    return { tenantId, themeConfig: brand.themeConfig };
  }

  async updateTheme(ctx: ServiceRequestContext, tenantId: string, dto: UpdateThemeDto) {
    if (tenantId !== ctx.tenantId) {
      throw new NotFoundException('Brand not found for tenant');
    }
    await this.findBrand(tenantId);
    const updated = await this.prisma.tenantBrand.update({
      where: { tenantId },
      data: { themeConfig: dto.themeConfig as object },
    });
    return { tenantId, themeConfig: updated.themeConfig };
  }
}
