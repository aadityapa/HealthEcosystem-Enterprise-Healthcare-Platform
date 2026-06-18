import { NotFoundException } from '@nestjs/common';
import { InstancesService } from './instances.service';
import { WorkflowEngineService } from '@/services/workflow-engine.service';

describe('InstancesService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    workflowInstance: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const workflowEngine = {
    startWorkflow: jest.fn(),
  };

  let service: InstancesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new InstancesService(prisma as never, workflowEngine as unknown as WorkflowEngineService);
  });

  it('delegates start to workflow engine', async () => {
    workflowEngine.startWorkflow.mockResolvedValue({ id: 'inst-1' });

    const result = await service.start(ctx, {
      definitionId: 'def-1',
      referenceType: 'result',
    });

    expect(result.id).toBe('inst-1');
    expect(workflowEngine.startWorkflow).toHaveBeenCalledWith(ctx, 'def-1', {
      referenceType: 'result',
      referenceId: undefined,
      context: undefined,
    });
  });

  it('throws NotFoundException when instance is missing', async () => {
    prisma.workflowInstance.findFirst.mockResolvedValue(null);

    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
