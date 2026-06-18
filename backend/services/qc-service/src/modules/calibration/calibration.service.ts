import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreateCalibrationLogDto,
  ListCalibrationQueryDto,
} from './dto/calibration.dto';

@Injectable()
export class CalibrationService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateCalibrationLogDto) {
    return this.prisma.calibrationLog.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        deviceId: dto.deviceId,
        calibratedAt: new Date(dto.calibratedAt),
        nextDueAt: dto.nextDueAt ? new Date(dto.nextDueAt) : undefined,
        performedBy: ctx.userId,
        certificateRef: dto.certificateRef,
        notes: dto.notes,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListCalibrationQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      ...(filters.deviceId ? { deviceId: filters.deviceId } : {}),
      ...(filters.dueBefore
        ? { nextDueAt: { lte: new Date(filters.dueBefore) } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.calibrationLog.findMany({
        where,
        skip,
        take,
        orderBy: { calibratedAt: 'desc' },
      }),
      this.prisma.calibrationLog.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const log = await this.prisma.calibrationLog.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!log) throw new NotFoundException('Calibration log not found');
    return log;
  }
}
