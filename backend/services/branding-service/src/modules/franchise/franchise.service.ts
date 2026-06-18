import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateFranchiseBrandDto, UpdateFranchiseBrandDto } from './dto/franchise.dto';

@Injectable()
export class FranchiseService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateFranchiseBrandDto) {
    return this.prisma.franchiseBrand.upsert({
      where: {
        tenantId_branchId: { tenantId: ctx.tenantId, branchId: dto.branchId },
      },
      create: {
        tenantId: ctx.tenantId,
        branchId: dto.branchId,
        brandName: dto.brandName,
        logoUrl: dto.logoUrl,
        themeConfig: (dto.themeConfig ?? {}) as object,
      },
      update: {
        brandName: dto.brandName,
        logoUrl: dto.logoUrl,
        themeConfig: (dto.themeConfig ?? {}) as object,
      },
    });
  }

  async list(ctx: ServiceRequestContext) {
    const items = await this.prisma.franchiseBrand.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return { items };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const brand = await this.prisma.franchiseBrand.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!brand) throw new NotFoundException('Franchise brand not found');
    return brand;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateFranchiseBrandDto) {
    await this.getById(ctx, id);
    return this.prisma.franchiseBrand.update({
      where: { id },
      data: {
        branchId: dto.branchId,
        brandName: dto.brandName,
        logoUrl: dto.logoUrl,
        themeConfig: dto.themeConfig as object | undefined,
        isActive: dto.isActive,
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.franchiseBrand.delete({ where: { id } });
    return { deleted: true };
  }
}
