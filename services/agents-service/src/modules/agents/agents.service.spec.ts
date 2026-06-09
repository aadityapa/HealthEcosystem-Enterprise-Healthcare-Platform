import { NotFoundException } from '@nestjs/common';
import { AgentType } from '@/common/agent-type';
import { AgentsService } from './agents.service';

describe('AgentsService', () => {
  const ctx = {
    tenantId: '11111111-1111-1111-1111-111111111111',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    aiAgent: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: AgentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AgentsService(prisma as never);
  });

  it('creates an AI agent', async () => {
    prisma.aiAgent.create.mockResolvedValue({ id: 'agent-1', name: 'Custom Agent' });
    const result = await service.create(ctx, {
      agentType: AgentType.LAB,
      name: 'Custom Agent',
    });
    expect(result.name).toBe('Custom Agent');
  });

  it('lists agents filtered by type', async () => {
    prisma.aiAgent.findMany.mockResolvedValue([{ agentType: AgentType.PATIENT }]);
    const result = await service.list(ctx, AgentType.PATIENT);
    expect(result.items).toHaveLength(1);
  });

  it('throws when agent not found', async () => {
    prisma.aiAgent.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });

  it('deletes an agent', async () => {
    prisma.aiAgent.findFirst.mockResolvedValue({ id: 'agent-1' });
    const result = await service.remove(ctx, 'agent-1');
    expect(result.deleted).toBe(true);
  });
});
