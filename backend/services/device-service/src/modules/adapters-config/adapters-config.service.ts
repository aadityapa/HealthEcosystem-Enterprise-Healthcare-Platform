import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { DeviceRequestContext } from '@/common/context/device-context';
import type { CreateAdapterConfigDto, UpdateAdapterConfigDto } from './adapters-config.dto';

@Injectable()
export class AdaptersConfigService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: DeviceRequestContext, dto: CreateAdapterConfigDto) {
    const device = await this.prisma.device.findFirst({
      where: { id: dto.deviceId, tenantId: ctx.tenantId },
    });
    if (!device) throw new NotFoundException('Device not found');

    return this.prisma.deviceAdapter.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        deviceId: dto.deviceId,
        vendor: dto.vendor,
        adapterVersion: dto.adapterVersion ?? '1.0.0',
        fieldMapping: (dto.fieldMapping ?? {}) as Prisma.InputJsonValue,
        transformationRules: (dto.transformationRules ?? {}) as Prisma.InputJsonValue,
        validationRules: (dto.validationRules ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async update(ctx: DeviceRequestContext, adapterId: string, dto: UpdateAdapterConfigDto) {
    const adapter = await this.prisma.deviceAdapter.findFirst({
      where: { id: adapterId, tenantId: ctx.tenantId },
    });
    if (!adapter) throw new NotFoundException('Adapter config not found');

    return this.prisma.deviceAdapter.update({
      where: { id: adapterId },
      data: {
        ...(dto.fieldMapping !== undefined && {
          fieldMapping: dto.fieldMapping as Prisma.InputJsonValue,
        }),
        ...(dto.transformationRules !== undefined && {
          transformationRules: dto.transformationRules as Prisma.InputJsonValue,
        }),
        ...(dto.validationRules !== undefined && {
          validationRules: dto.validationRules as Prisma.InputJsonValue,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async listByDevice(ctx: DeviceRequestContext, deviceId: string) {
    return this.prisma.deviceAdapter.findMany({
      where: { deviceId, tenantId: ctx.tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(ctx: DeviceRequestContext, adapterId: string) {
    const adapter = await this.prisma.deviceAdapter.findFirst({
      where: { id: adapterId, tenantId: ctx.tenantId },
    });
    if (!adapter) throw new NotFoundException('Adapter config not found');
    return adapter;
  }
}
