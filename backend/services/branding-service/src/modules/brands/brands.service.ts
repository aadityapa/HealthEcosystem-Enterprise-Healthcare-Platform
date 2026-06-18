import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateBrandDto, UpdateBrandDto } from './dto/brands.dto';

@Injectable()
export class BrandsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateBrandDto) {
    const existing = await this.prisma.tenantBrand.findUnique({
      where: { tenantId: ctx.tenantId },
    });
    if (existing) {
      throw new ConflictException('Brand already exists for this tenant');
    }

    return this.prisma.tenantBrand.create({
      data: {
        tenantId: ctx.tenantId,
        brandName: dto.brandName,
        logoUrl: dto.logoUrl,
        faviconUrl: dto.faviconUrl,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        customDomain: dto.customDomain,
        themeConfig: (dto.themeConfig ?? {}) as object,
        mobileAppConfig: (dto.mobileAppConfig ?? {}) as object,
      },
    });
  }

  async list(ctx: ServiceRequestContext) {
    const brand = await this.prisma.tenantBrand.findUnique({
      where: { tenantId: ctx.tenantId },
    });
    return { items: brand ? [brand] : [] };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const brand = await this.prisma.tenantBrand.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateBrandDto) {
    await this.getById(ctx, id);
    return this.prisma.tenantBrand.update({
      where: { id },
      data: {
        brandName: dto.brandName,
        logoUrl: dto.logoUrl,
        faviconUrl: dto.faviconUrl,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        customDomain: dto.customDomain,
        themeConfig: dto.themeConfig as object | undefined,
        mobileAppConfig: dto.mobileAppConfig as object | undefined,
        isActive: dto.isActive,
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.tenantBrand.delete({ where: { id } });
    return { deleted: true };
  }
}
