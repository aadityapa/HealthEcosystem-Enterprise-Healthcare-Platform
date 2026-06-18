import { TasksService } from './tasks.service';
import { WorkflowEngineService } from '@/services/workflow-engine.service';

describe('TasksService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    workflowTask: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const workflowEngine = {
    completeTask: jest.fn(),
    escalateTask: jest.fn(),
  };

  let service: TasksService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TasksService(prisma as never, workflowEngine as unknown as WorkflowEngineService);
  });

  it('lists tasks assigned to current user', async () => {
    prisma.workflowTask.findMany.mockResolvedValue([{ id: 'task-1' }]);
    prisma.workflowTask.count.mockResolvedValue(1);

    const result = await service.listMyTasks(ctx, {});

    expect(result.items).toHaveLength(1);
    expect(prisma.workflowTask.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { assignedTo: ctx.userId },
            expect.objectContaining({ assignedRole: { not: null } }),
          ]),
        }),
      }),
    );
  });

  it('delegates complete to workflow engine', async () => {
    workflowEngine.completeTask.mockResolvedValue({ id: 'inst-1', status: 'RUNNING' });

    await service.complete(ctx, 'task-1', { outcome: 'approved' });

    expect(workflowEngine.completeTask).toHaveBeenCalledWith(
      ctx,
      'task-1',
      'approved',
      undefined,
    );
  });

  it('delegates escalate to workflow engine', async () => {
    workflowEngine.escalateTask.mockResolvedValue({ id: 'inst-1', status: 'WAITING' });

    await service.escalate(ctx, 'task-1', { notes: 'overdue' });

    expect(workflowEngine.escalateTask).toHaveBeenCalledWith(ctx, 'task-1', 'overdue');
  });
});
