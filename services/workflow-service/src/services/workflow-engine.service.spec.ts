import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkflowInstanceStatus, WorkflowTaskStatus } from '@health/db';
import {
  WorkflowEngineService,
  calculateDueAt,
  isOverdue,
  parseBpmnSteps,
  PREDEFINED_WORKFLOWS,
  resolveWorkflowSteps,
} from './workflow-engine.service';

describe('WorkflowEngine helpers', () => {
  describe('parseBpmnSteps', () => {
    it('extracts userTask and serviceTask nodes from BPMN XML', () => {
      const xml = `
        <bpmn:process>
          <bpmn:userTask id="pathologist_review" name="Pathologist Review" />
          <bpmn:serviceTask id="patient_notification" name="Patient Notification" />
        </bpmn:process>
      `;

      const steps = parseBpmnSteps(xml);

      expect(steps).toHaveLength(2);
      expect(steps[0]).toEqual({
        taskKey: 'pathologist_review',
        name: 'Pathologist Review',
        taskType: 'userTask',
      });
      expect(steps[1]).toEqual({
        taskKey: 'patient_notification',
        name: 'Patient Notification',
        taskType: 'serviceTask',
      });
    });

    it('returns empty array for missing or empty BPMN XML', () => {
      expect(parseBpmnSteps(null)).toEqual([]);
      expect(parseBpmnSteps('')).toEqual([]);
    });
  });

  describe('resolveWorkflowSteps', () => {
    it('uses predefined critical-result workflow steps when BPMN is absent', () => {
      const steps = resolveWorkflowSteps('critical-result', null);

      expect(steps).toHaveLength(3);
      expect(steps.map((s) => s.taskKey)).toEqual([
        'pathologist_review',
        'senior_review',
        'patient_notification',
      ]);
    });

    it('prefers BPMN steps over predefined workflow', () => {
      const xml =
        '<bpmn:userTask id="custom_step" name="Custom Step" />';
      const steps = resolveWorkflowSteps('critical-result', xml, 45);

      expect(steps).toHaveLength(1);
      expect(steps[0].taskKey).toBe('custom_step');
      expect(steps[0].slaMinutes).toBe(45);
    });

    it('returns empty for unknown workflow without BPMN', () => {
      expect(resolveWorkflowSteps('unknown', null)).toEqual([]);
    });
  });

  describe('calculateDueAt', () => {
    it('adds SLA minutes to the base timestamp', () => {
      const base = new Date('2026-06-08T10:00:00Z');
      const dueAt = calculateDueAt(30, base);

      expect(dueAt?.toISOString()).toBe('2026-06-08T10:30:00.000Z');
    });

    it('returns undefined when SLA is not set', () => {
      expect(calculateDueAt(null)).toBeUndefined();
      expect(calculateDueAt(0)).toBeUndefined();
    });
  });

  describe('isOverdue', () => {
    it('detects overdue tasks', () => {
      const past = new Date('2020-01-01T00:00:00Z');
      const future = new Date('2099-01-01T00:00:00Z');

      expect(isOverdue(past, new Date('2026-01-01T00:00:00Z'))).toBe(true);
      expect(isOverdue(future, new Date('2026-01-01T00:00:00Z'))).toBe(false);
      expect(isOverdue(null)).toBe(false);
    });
  });

  describe('PREDEFINED_WORKFLOWS', () => {
    it('defines critical-result workflow with three steps', () => {
      expect(PREDEFINED_WORKFLOWS['critical-result']).toHaveLength(3);
    });
  });
});

describe('WorkflowEngineService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    workflowDefinition: { findFirst: jest.fn() },
    workflowInstance: {
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    workflowTask: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: WorkflowEngineService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WorkflowEngineService(prisma as never);
  });

  it('starts workflow from definition and creates tasks with dueAt', async () => {
    prisma.workflowDefinition.findFirst.mockResolvedValue({
      id: 'def-1',
      code: 'critical-result',
      bpmnXml: null,
      slaMinutes: 60,
    });
    prisma.workflowInstance.count.mockResolvedValue(0);
    prisma.workflowInstance.create.mockResolvedValue({
      id: 'inst-1',
      instanceNumber: 'WF-000001',
      currentStep: 'pathologist_review',
      tasks: [{ taskKey: 'pathologist_review', dueAt: new Date() }],
    });

    const result = await service.startWorkflow(ctx, 'def-1', {
      referenceType: 'result',
      referenceId: 'result-1',
    });

    expect(result.instanceNumber).toBe('WF-000001');
    expect(prisma.workflowInstance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: ctx.tenantId,
          currentStep: 'pathologist_review',
          tasks: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({
                taskKey: 'pathologist_review',
                status: WorkflowTaskStatus.ASSIGNED,
                dueAt: expect.any(Date),
              }),
            ]),
          }),
        }),
      }),
    );
  });

  it('throws when workflow definition is not found', async () => {
    prisma.workflowDefinition.findFirst.mockResolvedValue(null);

    await expect(service.startWorkflow(ctx, 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws when definition has no executable steps', async () => {
    prisma.workflowDefinition.findFirst.mockResolvedValue({
      id: 'def-1',
      code: 'unknown-workflow',
      bpmnXml: null,
      slaMinutes: null,
    });

    await expect(service.startWorkflow(ctx, 'def-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('completes task and advances to next step', async () => {
    prisma.workflowTask.findFirst.mockResolvedValue({
      id: 'task-1',
      taskKey: 'pathologist_review',
      status: WorkflowTaskStatus.ASSIGNED,
      instanceId: 'inst-1',
      instance: {
        tenantId: ctx.tenantId,
        definition: { code: 'critical-result', bpmnXml: null, slaMinutes: 60 },
        tasks: [
          { id: 'task-1', taskKey: 'pathologist_review' },
          { id: 'task-2', taskKey: 'senior_review' },
          { id: 'task-3', taskKey: 'patient_notification' },
        ],
      },
    });
    prisma.workflowTask.update.mockResolvedValue({});
    prisma.workflowInstance.update.mockResolvedValue({
      id: 'inst-1',
      status: WorkflowInstanceStatus.RUNNING,
      currentStep: 'senior_review',
    });

    const result = await service.completeTask(ctx, 'task-1', 'approved');

    expect(result.currentStep).toBe('senior_review');
    expect(prisma.workflowTask.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'task-2' },
        data: expect.objectContaining({ status: WorkflowTaskStatus.ASSIGNED }),
      }),
    );
  });

  it('completes workflow instance on final task', async () => {
    prisma.workflowTask.findFirst.mockResolvedValue({
      id: 'task-3',
      taskKey: 'patient_notification',
      status: WorkflowTaskStatus.ASSIGNED,
      instanceId: 'inst-1',
      instance: {
        tenantId: ctx.tenantId,
        definition: { code: 'critical-result', bpmnXml: null, slaMinutes: 60 },
        tasks: [
          { id: 'task-1', taskKey: 'pathologist_review' },
          { id: 'task-2', taskKey: 'senior_review' },
          { id: 'task-3', taskKey: 'patient_notification' },
        ],
      },
    });
    prisma.workflowTask.update.mockResolvedValue({});
    prisma.workflowInstance.update.mockResolvedValue({
      id: 'inst-1',
      status: WorkflowInstanceStatus.COMPLETED,
      currentStep: null,
    });

    const result = await service.completeTask(ctx, 'task-3');

    expect(result.status).toBe(WorkflowInstanceStatus.COMPLETED);
  });

  it('escalates overdue task and sets instance to WAITING', async () => {
    prisma.workflowTask.findFirst.mockResolvedValue({
      id: 'task-1',
      status: WorkflowTaskStatus.ASSIGNED,
      dueAt: new Date('2020-01-01'),
      instanceId: 'inst-1',
      instance: { tenantId: ctx.tenantId },
    });
    prisma.workflowTask.update.mockResolvedValue({});
    prisma.workflowInstance.update.mockResolvedValue({
      id: 'inst-1',
      status: WorkflowInstanceStatus.WAITING,
    });

    const result = await service.escalateTask(ctx, 'task-1', 'SLA breach');

    expect(result.status).toBe(WorkflowInstanceStatus.WAITING);
    expect(prisma.workflowTask.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: WorkflowTaskStatus.ESCALATED }),
      }),
    );
  });

  it('rejects escalation for non-overdue tasks', async () => {
    prisma.workflowTask.findFirst.mockResolvedValue({
      id: 'task-1',
      status: WorkflowTaskStatus.ASSIGNED,
      dueAt: new Date('2099-01-01'),
      instanceId: 'inst-1',
      instance: { tenantId: ctx.tenantId },
    });

    await expect(service.escalateTask(ctx, 'task-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('processes overdue tasks in batch', async () => {
    prisma.workflowTask.findMany.mockResolvedValue([
      { id: 'task-1', instanceId: 'inst-1' },
      { id: 'task-2', instanceId: 'inst-2' },
    ]);
    prisma.workflowTask.update.mockResolvedValue({});
    prisma.workflowInstance.update.mockResolvedValue({});

    const result = await service.processOverdueTasks(ctx.tenantId);

    expect(result.escalatedCount).toBe(2);
    expect(result.taskIds).toEqual(['task-1', 'task-2']);
  });
});
