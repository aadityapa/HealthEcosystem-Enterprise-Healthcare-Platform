import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { GpsHistoryQueryDto, RecordGpsPingDto } from './dto/tracking.dto';

@Injectable()
export class TrackingService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async recordPing(ctx: ServiceRequestContext, dto: RecordGpsPingDto) {
    const phlebotomist = await this.prisma.phlebotomist.findFirst({
      where: { id: dto.phlebotomistId, tenantId: ctx.tenantId },
    });
    if (!phlebotomist) throw new NotFoundException('Phlebotomist not found');

    const [ping] = await Promise.all([
      this.prisma.gpsPing.create({
        data: {
          tenantId: ctx.tenantId,
          phlebotomistId: dto.phlebotomistId,
          lat: dto.lat,
          lng: dto.lng,
          accuracy: dto.accuracy,
          speed: dto.speed,
        },
      }),
      this.prisma.phlebotomist.update({
        where: { id: dto.phlebotomistId },
        data: {
          currentLat: dto.lat,
          currentLng: dto.lng,
          lastPingAt: new Date(),
        },
      }),
    ]);

    return ping;
  }

  async getHistory(ctx: ServiceRequestContext, query: GpsHistoryQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where: Prisma.GpsPingWhereInput = {
      tenantId: ctx.tenantId,
      phlebotomistId: query.phlebotomistId,
      ...(query.from || query.to
        ? {
            recordedAt: {
              ...(query.from && { gte: new Date(query.from) }),
              ...(query.to && { lte: new Date(query.to) }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.gpsPing.findMany({
        where,
        skip,
        take,
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.gpsPing.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }
}
