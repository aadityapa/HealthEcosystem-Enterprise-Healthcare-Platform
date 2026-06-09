import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { SlaCalculatorService } from '@/services/sla-calculator.service';
import {
  CreateSlaDto,
  ListErrorBudgetsQueryDto,
  ListSlaQueryDto,
  UpdateSlaDto,
} from './dto/sla.dto';

@Injectable()
export class SlaService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly slaCalculator: SlaCalculatorService,
  ) {}

  async list(ctx: ServiceRequestContext, query: ListSlaQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = {
      tenantId: ctx.tenantId,
      ...(query.serviceName && { serviceName: query.serviceName }),
    };

    const [items, total] = await Promise.all([
      this.prisma.slaDefinition.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.slaDefinition.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const sla = await this.prisma.slaDefinition.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!sla) throw new NotFoundException('SLA definition not found');
    return sla;
  }

  async create(ctx: ServiceRequestContext, dto: CreateSlaDto) {
    const sla = await this.prisma.slaDefinition.create({
      data: {
        tenantId: ctx.tenantId,
        name: dto.name,
        serviceName: dto.serviceName,
        targetUptime: dto.targetUptime,
        targetLatencyMs: dto.targetLatencyMs,
        errorBudgetPct: dto.errorBudgetPct,
        windowDays: dto.windowDays ?? 30,
        isActive: dto.isActive ?? true,
      },
    });

    await this.slaCalculator.refreshErrorBudget(sla.id);
    return sla;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateSlaDto) {
    await this.getById(ctx, id);
    const sla = await this.prisma.slaDefinition.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.serviceName !== undefined && { serviceName: dto.serviceName }),
        ...(dto.targetUptime !== undefined && { targetUptime: dto.targetUptime }),
        ...(dto.targetLatencyMs !== undefined && { targetLatencyMs: dto.targetLatencyMs }),
        ...(dto.errorBudgetPct !== undefined && { errorBudgetPct: dto.errorBudgetPct }),
        ...(dto.windowDays !== undefined && { windowDays: dto.windowDays }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    await this.slaCalculator.refreshErrorBudget(sla.id);
    return sla;
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.slaDefinition.delete({ where: { id } });
    return { deleted: true };
  }

  async listErrorBudgets(ctx: ServiceRequestContext, query: ListErrorBudgetsQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);

    const slaIds = query.slaId
      ? [query.slaId]
      : (
          await this.prisma.slaDefinition.findMany({
            where: { tenantId: ctx.tenantId },
            select: { id: true },
          })
        ).map((s) => s.id);

    const where = { slaId: { in: slaIds } };

    const [items, total] = await Promise.all([
      this.prisma.errorBudget.findMany({
        where,
        skip,
        take,
        orderBy: { periodStart: 'desc' },
        include: { sla: { select: { name: true, serviceName: true } } },
      }),
      this.prisma.errorBudget.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }
}
