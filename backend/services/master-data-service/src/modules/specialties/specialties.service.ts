import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { MasterRequestContext } from '@/common/context/master-context';
import { MasterEventsService } from '@/common/services/master-events.service';

@Injectable()
export class SpecialtiesService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly events: MasterEventsService,
  ) {}

  async create(
    ctx: MasterRequestContext,
    dto: { code: string; name: string; description?: string },
  ) {
    const existing = await this.prisma.specialty.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Specialty code "${dto.code}" already exists`);
    }

    const specialty = await this.prisma.specialty.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
      },
    });

    await this.events.publishUpdated(ctx, 'Specialty', specialty.id, 'created', {
      code: specialty.code,
    });

    return specialty;
  }

  async get(ctx: MasterRequestContext, specialtyId: string) {
    const specialty = await this.prisma.specialty.findFirst({
      where: { id: specialtyId, tenantId: ctx.tenantId },
    });
    if (!specialty) throw new NotFoundException('Specialty not found');
    return specialty;
  }

  async list(
    ctx: MasterRequestContext,
    filters: { isActive?: boolean; page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.SpecialtyWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.specialty.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.specialty.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async update(
    ctx: MasterRequestContext,
    specialtyId: string,
    dto: { name?: string; description?: string; isActive?: boolean },
  ) {
    await this.get(ctx, specialtyId);

    const specialty = await this.prisma.specialty.update({
      where: { id: specialtyId, tenantId: ctx.tenantId },
      data: dto,
    });

    await this.events.publishUpdated(ctx, 'Specialty', specialty.id, 'updated');

    return specialty;
  }
}
