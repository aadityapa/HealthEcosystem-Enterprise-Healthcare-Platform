import { Inject, Injectable } from '@nestjs/common';
import { WorkflowTaskStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { WorkflowEngineService } from '@/services/workflow-engine.service';
import type { CompleteTaskDto, EscalateTaskDto, ListTasksQueryDto } from './dto/tasks.dto';

@Injectable()
export class TasksService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly workflowEngine: WorkflowEngineService,
  ) {}

  async listMyTasks(
    ctx: ServiceRequestContext,
    filters: ListTasksQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where = {
      OR: [
        { assignedTo: ctx.userId },
        { assignedRole: { not: null }, status: WorkflowTaskStatus.ASSIGNED },
      ],
      ...(filters.status ? { status: filters.status } : {}),
      instance: { tenantId: ctx.tenantId },
    };

    const [items, total] = await Promise.all([
      this.prisma.workflowTask.findMany({
        where,
        skip,
        take,
        orderBy: { dueAt: 'asc' },
        include: { instance: { include: { definition: true } } },
      }),
      this.prisma.workflowTask.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async complete(ctx: ServiceRequestContext, id: string, dto: CompleteTaskDto) {
    return this.workflowEngine.completeTask(ctx, id, dto.outcome, dto.notes);
  }

  async escalate(ctx: ServiceRequestContext, id: string, dto: EscalateTaskDto) {
    return this.workflowEngine.escalateTask(ctx, id, dto.notes);
  }
}
