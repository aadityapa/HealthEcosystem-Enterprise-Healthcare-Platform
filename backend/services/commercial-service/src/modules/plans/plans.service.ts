import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreatePlanDto, UpdatePlanDto } from './dto/plans.dto';

@Injectable()
export class PlansService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(_ctx: ServiceRequestContext, dto: CreatePlanDto) {
    const existing = await this.prisma.subscriptionPlan.findUnique({
      where: { code: dto.code },
    });
    if (existing) throw new ConflictException('Plan code already exists');

    return this.prisma.subscriptionPlan.create({
      data: {
        code: dto.code,
        name: dto.name,
        tier: dto.tier,
        monthlyPrice: dto.monthlyPrice,
        annualPrice: dto.annualPrice,
        maxBranches: dto.maxBranches,
        maxUsers: dto.maxUsers,
        features: (dto.features ?? []) as Prisma.InputJsonValue,
      },
    });
  }

  async list(_ctx: ServiceRequestContext, page = 1, limit = 20, activeOnly = true) {
    const { skip, take } = paginate(page, limit);
    const where = activeOnly ? { isActive: true } : {};

    const [items, total] = await Promise.all([
      this.prisma.subscriptionPlan.findMany({
        where,
        skip,
        take,
        orderBy: { monthlyPrice: 'asc' },
      }),
      this.prisma.subscriptionPlan.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(_ctx: ServiceRequestContext, id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Subscription plan not found');
    return plan;
  }

  async update(_ctx: ServiceRequestContext, id: string, dto: UpdatePlanDto) {
    await this.getById(_ctx, id);
    const { features, ...rest } = dto;
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...rest,
        ...(features !== undefined && { features: features as Prisma.InputJsonValue }),
      },
    });
  }

  async remove(_ctx: ServiceRequestContext, id: string) {
    await this.getById(_ctx, id);
    await this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });
    return { deleted: true };
  }
}
