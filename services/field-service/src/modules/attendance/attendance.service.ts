import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { isWithinGeofence, toNumber } from '@/common/utils/geofence.util';
import type { CheckInDto, CheckOutDto, ListAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async checkIn(ctx: ServiceRequestContext, dto: CheckInDto) {
    const phlebotomist = await this.prisma.phlebotomist.findFirst({
      where: { id: dto.phlebotomistId, tenantId: ctx.tenantId },
    });
    if (!phlebotomist) throw new NotFoundException('Phlebotomist not found');

    const openSession = await this.prisma.fieldAttendance.findFirst({
      where: { phlebotomistId: dto.phlebotomistId, checkOutAt: null },
      orderBy: { checkInAt: 'desc' },
    });
    if (openSession) {
      throw new BadRequestException('Phlebotomist already checked in');
    }

    const geofences = await this.prisma.geoFence.findMany({
      where: { tenantId: ctx.tenantId, branchId: ctx.branchId, isActive: true },
    });

    const withinGeofence = geofences.some((fence) =>
      isWithinGeofence(
        dto.lat,
        dto.lng,
        toNumber(fence.centerLat),
        toNumber(fence.centerLng),
        fence.radiusMeters,
      ),
    );

    return this.prisma.fieldAttendance.create({
      data: {
        tenantId: ctx.tenantId,
        phlebotomistId: dto.phlebotomistId,
        checkInAt: new Date(),
        checkInLat: dto.lat,
        checkInLng: dto.lng,
        withinGeofence,
      },
    });
  }

  async checkOut(ctx: ServiceRequestContext, dto: CheckOutDto) {
    const openSession = await this.prisma.fieldAttendance.findFirst({
      where: {
        tenantId: ctx.tenantId,
        phlebotomistId: dto.phlebotomistId,
        checkOutAt: null,
      },
      orderBy: { checkInAt: 'desc' },
    });

    if (!openSession) {
      throw new BadRequestException('No active check-in session found');
    }

    return this.prisma.fieldAttendance.update({
      where: { id: openSession.id },
      data: { checkOutAt: new Date() },
    });
  }

  async list(ctx: ServiceRequestContext, query: ListAttendanceDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = {
      tenantId: ctx.tenantId,
      ...(query.phlebotomistId && { phlebotomistId: query.phlebotomistId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.fieldAttendance.findMany({
        where,
        skip,
        take,
        orderBy: { checkInAt: 'desc' },
      }),
      this.prisma.fieldAttendance.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }
}
