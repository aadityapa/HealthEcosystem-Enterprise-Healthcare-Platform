import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CampStatus, Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreateCampDto,
  ListCampsQueryDto,
  RegisterCampPatientDto,
  UpdateCampDto,
} from './dto/camps.dto';

@Injectable()
export class CampsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async createCamp(ctx: ServiceRequestContext, dto: CreateCampDto) {
    const existing = await this.prisma.camp.findFirst({
      where: { tenantId: ctx.tenantId, campCode: dto.campCode },
    });
    if (existing) {
      throw new ConflictException(`Camp code "${dto.campCode}" already exists`);
    }

    return this.prisma.camp.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        campCode: dto.campCode,
        name: dto.name,
        location: dto.location,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        targetCount: dto.targetCount,
        packageIds: (dto.packageIds ?? []) as Prisma.InputJsonValue,
      },
    });
  }

  async getCamp(ctx: ServiceRequestContext, campId: string) {
    const camp = await this.prisma.camp.findFirst({
      where: { id: campId, tenantId: ctx.tenantId },
      include: {
        registrations: { orderBy: { registeredAt: 'desc' }, take: 20 },
      },
    });
    if (!camp) throw new NotFoundException('Camp not found');
    return camp;
  }

  async listCamps(ctx: ServiceRequestContext, filters: ListCampsQueryDto) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where = {
      tenantId: ctx.tenantId,
      ...(filters.status && { status: filters.status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.camp.findMany({
        where,
        skip,
        take,
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.camp.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async updateCamp(
    ctx: ServiceRequestContext,
    campId: string,
    dto: UpdateCampDto,
  ) {
    await this.getCamp(ctx, campId);

    const { startDate, endDate, packageIds, ...rest } = dto;

    return this.prisma.camp.update({
      where: { id: campId },
      data: {
        ...rest,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(packageIds !== undefined && {
          packageIds: packageIds as Prisma.InputJsonValue,
        }),
      },
    });
  }

  async registerPatient(
    ctx: ServiceRequestContext,
    campId: string,
    dto: RegisterCampPatientDto,
  ) {
    const camp = await this.prisma.camp.findFirst({
      where: { id: campId, tenantId: ctx.tenantId },
    });
    if (!camp) throw new NotFoundException('Camp not found');
    if (camp.status === CampStatus.CANCELLED) {
      throw new ConflictException('Cannot register patients for a cancelled camp');
    }

    return this.prisma.$transaction(async (tx) => {
      const registration = await tx.campRegistration.create({
        data: {
          campId,
          patientId: dto.patientId,
          name: dto.name,
          phone: dto.phone,
        },
      });

      await tx.camp.update({
        where: { id: campId },
        data: { actualCount: { increment: 1 } },
      });

      return registration;
    });
  }
}
