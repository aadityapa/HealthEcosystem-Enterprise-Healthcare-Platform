import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreateAutomationRuleDto,
  ListAutomationQueryDto,
  UpdateAutomationRuleDto,
} from './dto/automation.dto';

@Injectable()
export class AutomationService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateAutomationRuleDto) {
    return this.prisma.automationRule.create({
      data: {
        tenantId: ctx.tenantId,
        name: dto.name,
        triggerEvent: dto.triggerEvent,
        conditions: (dto.conditions ?? {}) as object,
        workflowCode: dto.workflowCode,
      },
    });
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListAutomationQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where = {
      tenantId: ctx.tenantId,
      ...(filters.triggerEvent ? { triggerEvent: filters.triggerEvent } : {}),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.automationRule.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.automationRule.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const rule = await this.prisma.automationRule.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });

    if (!rule) {
      throw new NotFoundException('Automation rule not found');
    }

    return rule;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateAutomationRuleDto) {
    await this.getById(ctx, id);

    return this.prisma.automationRule.update({
      where: { id },
      data: {
        ...dto,
        conditions: dto.conditions ? (dto.conditions as object) : undefined,
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);

    return this.prisma.automationRule.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByTrigger(ctx: ServiceRequestContext, triggerEvent: string) {
    return this.prisma.automationRule.findMany({
      where: {
        tenantId: ctx.tenantId,
        triggerEvent,
        isActive: true,
      },
    });
  }
}
