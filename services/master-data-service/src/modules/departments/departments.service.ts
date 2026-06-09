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
export class DepartmentsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly events: MasterEventsService,
  ) {}

  async create(
    ctx: MasterRequestContext,
    dto: { code: string; name: string; departmentType: string },
  ) {
    const existing = await this.prisma.departmentMaster.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Department code "${dto.code}" already exists`);
    }

    const department = await this.prisma.departmentMaster.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        departmentType: dto.departmentType,
      },
    });

    await this.events.publishUpdated(ctx, 'DepartmentMaster', department.id, 'created', {
      code: department.code,
    });

    return department;
  }

  async get(ctx: MasterRequestContext, departmentId: string) {
    const department = await this.prisma.departmentMaster.findFirst({
      where: { id: departmentId, tenantId: ctx.tenantId },
    });
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async list(
    ctx: MasterRequestContext,
    filters: {
      departmentType?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.DepartmentMasterWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.departmentType && { departmentType: filters.departmentType }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.departmentMaster.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.departmentMaster.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async update(
    ctx: MasterRequestContext,
    departmentId: string,
    dto: { name?: string; departmentType?: string; isActive?: boolean },
  ) {
    await this.get(ctx, departmentId);

    const department = await this.prisma.departmentMaster.update({
      where: { id: departmentId, tenantId: ctx.tenantId },
      data: dto,
    });

    await this.events.publishUpdated(ctx, 'DepartmentMaster', department.id, 'updated');

    return department;
  }
}
