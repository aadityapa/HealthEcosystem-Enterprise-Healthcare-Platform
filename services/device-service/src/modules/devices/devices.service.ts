import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeviceStatus,
  type Device,
  type Prisma,
  type PrismaClient,
} from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { createEvent } from '@health/events';
import { EVENT_TYPES } from '@health/shared-types';
import { PRISMA } from '@/database/database.module';
import type { DeviceRequestContext } from '@/common/context/device-context';
import type {
  ConfigureDeviceDto,
  ListDevicesQueryDto,
  RegisterDeviceDto,
  UpdateDeviceDto,
} from './dto/devices.dto';

@Injectable()
export class DevicesService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async registerDevice(ctx: DeviceRequestContext, dto: RegisterDeviceDto): Promise<Device> {
    const existing = await this.prisma.device.findFirst({
      where: { tenantId: ctx.tenantId, deviceCode: dto.deviceCode },
    });
    if (existing) {
      throw new ConflictException(`Device code "${dto.deviceCode}" already exists`);
    }

    const device = await this.prisma.device.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        deviceCode: dto.deviceCode,
        name: dto.name,
        vendor: dto.vendor,
        model: dto.model,
        serialNumber: dto.serialNumber,
        protocol: dto.protocol,
        connectionType: dto.connectionType,
        connectionConfig: (dto.connectionConfig ?? {}) as Prisma.InputJsonValue,
        firmwareVersion: dto.firmwareVersion,
        softwareVersion: dto.softwareVersion,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
        status: DeviceStatus.OFFLINE,
      },
    });

    await this.prisma.deviceAdapter.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        deviceId: device.id,
        adapterVersion: '1.0.0',
        vendor: dto.vendor,
      },
    });

    createEvent(EVENT_TYPES.DEVICE_REGISTERED, 'Device', device.id, ctx.tenantId, {
      deviceCode: device.deviceCode,
      vendor: device.vendor,
      protocol: device.protocol,
    }, {
      organizationId: ctx.organizationId,
      branchId: ctx.branchId,
      userId: ctx.userId,
    });

    return device;
  }

  async updateDevice(
    ctx: DeviceRequestContext,
    deviceId: string,
    dto: UpdateDeviceDto,
  ): Promise<Device> {
    await this.getDeviceOrThrow(ctx, deviceId);

    return this.prisma.device.update({
      where: { id: deviceId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.model !== undefined && { model: dto.model }),
        ...(dto.serialNumber !== undefined && { serialNumber: dto.serialNumber }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.connectionConfig !== undefined && {
          connectionConfig: dto.connectionConfig as Prisma.InputJsonValue,
        }),
        ...(dto.firmwareVersion !== undefined && { firmwareVersion: dto.firmwareVersion }),
        ...(dto.softwareVersion !== undefined && { softwareVersion: dto.softwareVersion }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as Prisma.InputJsonValue }),
      },
    });
  }

  async configureDevice(
    ctx: DeviceRequestContext,
    deviceId: string,
    dto: ConfigureDeviceDto,
  ): Promise<Device> {
    await this.getDeviceOrThrow(ctx, deviceId);

    return this.prisma.device.update({
      where: { id: deviceId },
      data: {
        ...(dto.protocol !== undefined && { protocol: dto.protocol }),
        ...(dto.connectionType !== undefined && { connectionType: dto.connectionType }),
        ...(dto.connectionConfig !== undefined && {
          connectionConfig: dto.connectionConfig as Prisma.InputJsonValue,
        }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as Prisma.InputJsonValue }),
      },
    });
  }

  async getDevice(ctx: DeviceRequestContext, deviceId: string) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, tenantId: ctx.tenantId },
      include: {
        adapters: { where: { isActive: true }, take: 1 },
        connections: { where: { isActive: true } },
        health: { orderBy: { recordedAt: 'desc' }, take: 1 },
      },
    });
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  async listDevices(ctx: DeviceRequestContext, filters: ListDevicesQueryDto) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);

    const where = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      ...(filters.status !== undefined && { status: filters.status }),
      ...(filters.vendor !== undefined && { vendor: filters.vendor }),
      ...(filters.protocol !== undefined && { protocol: filters.protocol }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.device.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.device.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async getDeviceOrThrow(ctx: DeviceRequestContext, deviceId: string): Promise<Device> {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, tenantId: ctx.tenantId },
    });
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }
}
