import {
  Inject,
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RouteStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { RouteOptimizerService } from '@/services/route-optimizer.service';
import { toNumber } from '@/common/utils/geofence.util';
import type {
  CreateRouteDto,
  ListRoutesDto,
  OptimizeRouteDto,
} from './dto/routes.dto';

@Injectable()
export class RoutesService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly routeOptimizer: RouteOptimizerService,
  ) {}

  async create(ctx: ServiceRequestContext, dto: CreateRouteDto) {
    const existing = await this.prisma.fieldRoute.findFirst({
      where: { tenantId: ctx.tenantId, routeNumber: dto.routeNumber },
    });
    if (existing) {
      throw new ConflictException(`Route number "${dto.routeNumber}" already exists`);
    }

    const phlebotomist = await this.prisma.phlebotomist.findFirst({
      where: { id: dto.phlebotomistId, tenantId: ctx.tenantId },
    });
    if (!phlebotomist) throw new NotFoundException('Phlebotomist not found');

    return this.prisma.fieldRoute.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        phlebotomistId: dto.phlebotomistId,
        routeNumber: dto.routeNumber,
        routeDate: new Date(dto.routeDate),
        totalStops: dto.stops.length,
        stops: {
          create: dto.stops.map((stop, index) => ({
            stopOrder: index + 1,
            patientId: stop.patientId,
            patientName: stop.patientName,
            address: (stop.address ?? {}) as Prisma.InputJsonValue,
            lat: stop.lat,
            lng: stop.lng,
            scheduledAt: stop.scheduledAt ? new Date(stop.scheduledAt) : undefined,
            orderId: stop.orderId,
            notes: stop.notes,
          })),
        },
      },
      include: { stops: { orderBy: { stopOrder: 'asc' } }, phlebotomist: true },
    });
  }

  async get(ctx: ServiceRequestContext, id: string) {
    const route = await this.prisma.fieldRoute.findFirst({
      where: { id, tenantId: ctx.tenantId },
      include: {
        stops: { orderBy: { stopOrder: 'asc' }, include: { proof: true } },
        phlebotomist: true,
      },
    });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async list(ctx: ServiceRequestContext, query: ListRoutesDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where: Prisma.FieldRouteWhereInput = {
      tenantId: ctx.tenantId,
      organizationId: ctx.organizationId,
      ...(query.phlebotomistId && { phlebotomistId: query.phlebotomistId }),
      ...(query.status && { status: query.status }),
      ...(query.routeDate && { routeDate: new Date(query.routeDate) }),
    };

    const [items, total] = await Promise.all([
      this.prisma.fieldRoute.findMany({
        where,
        skip,
        take,
        orderBy: { routeDate: 'desc' },
        include: { phlebotomist: true, stops: { orderBy: { stopOrder: 'asc' } } },
      }),
      this.prisma.fieldRoute.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async optimize(ctx: ServiceRequestContext, id: string, dto: OptimizeRouteDto) {
    const route = await this.get(ctx, id);
    if (route.status !== RouteStatus.PLANNED) {
      throw new BadRequestException('Only planned routes can be optimized');
    }

    const optimizable = route.stops
      .filter((s) => s.lat != null && s.lng != null)
      .map((s) => ({
        id: s.id,
        lat: toNumber(s.lat),
        lng: toNumber(s.lng),
      }));

    if (optimizable.length < 2) {
      throw new BadRequestException('At least two stops with coordinates are required');
    }

    const orderedIds = this.routeOptimizer.optimizeNearestNeighbor(optimizable, {
      startLat: dto.startLat,
      startLng: dto.startLng,
    });

    await Promise.all(
      orderedIds.map((stopId, index) =>
        this.prisma.routeStop.update({
          where: { id: stopId },
          data: { stopOrder: index + 1 },
        }),
      ),
    );

    return this.prisma.fieldRoute.update({
      where: { id },
      data: { optimizedOrder: orderedIds },
      include: { stops: { orderBy: { stopOrder: 'asc' } }, phlebotomist: true },
    });
  }

  async start(ctx: ServiceRequestContext, id: string) {
    const route = await this.get(ctx, id);
    if (route.status !== RouteStatus.PLANNED) {
      throw new BadRequestException('Route must be in PLANNED status to start');
    }

    return this.prisma.fieldRoute.update({
      where: { id },
      data: { status: RouteStatus.IN_PROGRESS, startedAt: new Date() },
      include: { stops: { orderBy: { stopOrder: 'asc' } }, phlebotomist: true },
    });
  }

  async complete(ctx: ServiceRequestContext, id: string) {
    const route = await this.get(ctx, id);
    if (route.status !== RouteStatus.IN_PROGRESS) {
      throw new BadRequestException('Route must be in progress to complete');
    }

    const completedStops = route.stops.filter((s) => s.status === 'COLLECTED').length;

    return this.prisma.fieldRoute.update({
      where: { id },
      data: {
        status: RouteStatus.COMPLETED,
        completedAt: new Date(),
        completedStops,
      },
      include: { stops: { orderBy: { stopOrder: 'asc' } }, phlebotomist: true },
    });
  }
}
