import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreateWorkflowDefinitionDto,
  ListDefinitionsQueryDto,
  UpdateWorkflowDefinitionDto,
} from './dto/definitions.dto';

@Injectable()
export class DefinitionsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateWorkflowDefinitionDto) {
    const existing = await this.prisma.workflowDefinition.findFirst({
      where: {
        tenantId: ctx.tenantId,
        code: dto.code,
        version: 1,
      },
    });

    if (existing) {
      throw new ConflictException(`Workflow definition with code "${dto.code}" already exists`);
    }

    return this.prisma.workflowDefinition.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        category: dto.category,
        bpmnXml: dto.bpmnXml,
        slaMinutes: dto.slaMinutes,
      },
    });
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListDefinitionsQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where = {
      tenantId: ctx.tenantId,
      organizationId: ctx.organizationId,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.workflowDefinition.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workflowDefinition.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const definition = await this.prisma.workflowDefinition.findFirst({
      where: {
        id,
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
      },
    });

    if (!definition) {
      throw new NotFoundException('Workflow definition not found');
    }

    return definition;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateWorkflowDefinitionDto) {
    await this.getById(ctx, id);

    return this.prisma.workflowDefinition.update({
      where: { id },
      data: dto,
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);

    return this.prisma.workflowDefinition.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
