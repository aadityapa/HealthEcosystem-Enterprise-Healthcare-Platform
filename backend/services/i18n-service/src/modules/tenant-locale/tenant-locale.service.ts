import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateTenantLocaleDto, UpdateTenantLocaleDto } from './dto/tenant-locale.dto';

@Injectable()
export class TenantLocaleService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateTenantLocaleDto) {
    if (dto.isPrimary) {
      await this.prisma.tenantLocale.updateMany({
        where: { tenantId: ctx.tenantId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.tenantLocale.upsert({
      where: {
        tenantId_countryCode: { tenantId: ctx.tenantId, countryCode: dto.countryCode },
      },
      create: {
        tenantId: ctx.tenantId,
        countryCode: dto.countryCode,
        currency: dto.currency,
        locale: dto.locale,
        timezone: dto.timezone,
        dateFormat: dto.dateFormat,
        isPrimary: dto.isPrimary ?? false,
      },
      update: {
        currency: dto.currency,
        locale: dto.locale,
        timezone: dto.timezone,
        dateFormat: dto.dateFormat,
        isPrimary: dto.isPrimary,
      },
    });
  }

  async list(ctx: ServiceRequestContext) {
    const items = await this.prisma.tenantLocale.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: [{ isPrimary: 'desc' }, { countryCode: 'asc' }],
    });
    return { items };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const record = await this.prisma.tenantLocale.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!record) throw new NotFoundException('Tenant locale not found');
    return record;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateTenantLocaleDto) {
    await this.getById(ctx, id);
    if (dto.isPrimary) {
      await this.prisma.tenantLocale.updateMany({
        where: { tenantId: ctx.tenantId, id: { not: id } },
        data: { isPrimary: false },
      });
    }
    return this.prisma.tenantLocale.update({
      where: { id },
      data: {
        countryCode: dto.countryCode,
        currency: dto.currency,
        locale: dto.locale,
        timezone: dto.timezone,
        dateFormat: dto.dateFormat,
        isPrimary: dto.isPrimary,
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.tenantLocale.delete({ where: { id } });
    return { deleted: true };
  }
}
