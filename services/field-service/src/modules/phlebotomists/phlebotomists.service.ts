import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreatePhlebotomistDto,
  ListPhlebotomistsDto,
  UpdatePhlebotomistDto,
} from './dto/phlebotomists.dto';

@Injectable()
export class PhlebotomistsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreatePhlebotomistDto) {
    const existing = await this.prisma.phlebotomist.findFirst({
      where: { tenantId: ctx.tenantId, employeeCode: dto.employeeCode },
    });
    if (existing) {
      throw new ConflictException(`Employee code "${dto.employeeCode}" already exists`);
    }

    return this.prisma.phlebotomist.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        employeeCode: dto.employeeCode,
        name: dto.name,
        phone: dto.phone,
        userId: dto.userId,
      },
    });
  }

  async get(ctx: ServiceRequestContext, id: string) {
    const phlebotomist = await this.prisma.phlebotomist.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!phlebotomist) throw new NotFoundException('Phlebotomist not found');
    return phlebotomist;
  }

  async list(ctx: ServiceRequestContext, query: ListPhlebotomistsDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = {
      tenantId: ctx.tenantId,
      organizationId: ctx.organizationId,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.phlebotomist.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.phlebotomist.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdatePhlebotomistDto) {
    await this.get(ctx, id);
    return this.prisma.phlebotomist.update({
      where: { id },
      data: dto,
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.get(ctx, id);
    await this.prisma.phlebotomist.update({
      where: { id },
      data: { isActive: false },
    });
    return { success: true };
  }
}
