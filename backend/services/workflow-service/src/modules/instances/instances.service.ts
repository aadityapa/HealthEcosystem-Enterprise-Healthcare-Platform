import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WorkflowInstanceStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { WorkflowEngineService } from '@/services/workflow-engine.service';
import type { ListInstancesQueryDto, StartWorkflowInstanceDto } from './dto/instances.dto';

@Injectable()
export class InstancesService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly workflowEngine: WorkflowEngineService,
  ) {}

  async start(ctx: ServiceRequestContext, dto: StartWorkflowInstanceDto) {
    return this.workflowEngine.startWorkflow(ctx, dto.definitionId, {
      referenceType: dto.referenceType,
      referenceId: dto.referenceId,
      context: dto.context,
    });
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListInstancesQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where = {
      tenantId: ctx.tenantId,
      ...(filters.status
        ? { status: filters.status as WorkflowInstanceStatus }
        : {}),
      ...(filters.referenceType ? { referenceType: filters.referenceType } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.workflowInstance.findMany({
        where,
        skip,
        take,
        orderBy: { startedAt: 'desc' },
        include: { definition: true, tasks: true },
      }),
      this.prisma.workflowInstance.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const instance = await this.prisma.workflowInstance.findFirst({
      where: { id, tenantId: ctx.tenantId },
      include: { definition: true, tasks: true },
    });

    if (!instance) {
      throw new NotFoundException('Workflow instance not found');
    }

    return instance;
  }
}
