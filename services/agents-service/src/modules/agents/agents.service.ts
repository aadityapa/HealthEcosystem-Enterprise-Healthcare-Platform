import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import type { AgentTypeValue } from '@/common/agent-type';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateAgentDto, UpdateAgentDto } from './dto/agents.dto';

@Injectable()
export class AgentsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateAgentDto) {
    return this.prisma.aiAgent.create({
      data: {
        tenantId: ctx.tenantId,
        agentType: dto.agentType,
        name: dto.name,
        description: dto.description,
        systemPrompt: dto.systemPrompt,
        capabilities: (dto.capabilities ?? []) as object,
        modelKey: dto.modelKey,
      },
    });
  }

  async list(ctx: ServiceRequestContext, agentType?: AgentTypeValue) {
    const items = await this.prisma.aiAgent.findMany({
      where: {
        tenantId: ctx.tenantId,
        ...(agentType ? { agentType } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return { items };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const agent = await this.prisma.aiAgent.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateAgentDto) {
    await this.getById(ctx, id);
    return this.prisma.aiAgent.update({
      where: { id },
      data: {
        agentType: dto.agentType,
        name: dto.name,
        description: dto.description,
        systemPrompt: dto.systemPrompt,
        capabilities: dto.capabilities as object | undefined,
        modelKey: dto.modelKey,
        isActive: dto.isActive,
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.aiAgent.delete({ where: { id } });
    return { deleted: true };
  }
}
