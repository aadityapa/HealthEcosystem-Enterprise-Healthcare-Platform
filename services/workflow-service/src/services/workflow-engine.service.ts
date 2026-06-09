import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  WorkflowInstanceStatus,
  WorkflowTaskStatus,
  type PrismaClient,
} from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';

export interface WorkflowStep {
  taskKey: string;
  name: string;
  taskType: string;
  assignedRole?: string;
  slaMinutes?: number;
}

export const PREDEFINED_WORKFLOWS: Record<string, WorkflowStep[]> = {
  'critical-result': [
    {
      taskKey: 'pathologist_review',
      name: 'Pathologist Review',
      taskType: 'userTask',
      assignedRole: 'pathologist',
      slaMinutes: 30,
    },
    {
      taskKey: 'senior_review',
      name: 'Senior Review',
      taskType: 'userTask',
      assignedRole: 'senior_pathologist',
      slaMinutes: 60,
    },
    {
      taskKey: 'patient_notification',
      name: 'Patient Notification',
      taskType: 'serviceTask',
      assignedRole: 'lab_manager',
      slaMinutes: 120,
    },
  ],
};

export function parseBpmnSteps(bpmnXml: string | null | undefined): WorkflowStep[] {
  if (!bpmnXml?.trim()) return [];

  const steps: WorkflowStep[] = [];
  const taskRegex =
    /<(bpmn:userTask|bpmn:serviceTask|userTask|serviceTask)\b[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = taskRegex.exec(bpmnXml)) !== null) {
    const tag = match[0];
    const taskType = tag.includes('serviceTask') ? 'serviceTask' : 'userTask';
    const idMatch = tag.match(/\bid="([^"]+)"/i);
    const nameMatch = tag.match(/\bname="([^"]*)"/i);

    if (idMatch) {
      steps.push({
        taskKey: idMatch[1],
        name: nameMatch?.[1] || idMatch[1],
        taskType,
      });
    }
  }

  return steps;
}

export function resolveWorkflowSteps(
  code: string,
  bpmnXml: string | null | undefined,
  defaultSlaMinutes?: number | null,
): WorkflowStep[] {
  const fromBpmn = parseBpmnSteps(bpmnXml);
  if (fromBpmn.length > 0) {
    return fromBpmn.map((step) => ({
      ...step,
      slaMinutes: step.slaMinutes ?? defaultSlaMinutes ?? undefined,
    }));
  }

  const predefined = PREDEFINED_WORKFLOWS[code];
  if (predefined) {
    return predefined.map((step) => ({
      ...step,
      slaMinutes: step.slaMinutes ?? defaultSlaMinutes ?? undefined,
    }));
  }

  return [];
}

export function calculateDueAt(slaMinutes?: number | null, from = new Date()): Date | undefined {
  if (!slaMinutes || slaMinutes <= 0) return undefined;
  return new Date(from.getTime() + slaMinutes * 60_000);
}

export function isOverdue(dueAt: Date | null | undefined, now = new Date()): boolean {
  return !!dueAt && dueAt.getTime() < now.getTime();
}

@Injectable()
export class WorkflowEngineService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async startWorkflow(
    ctx: ServiceRequestContext,
    definitionId: string,
    options: {
      referenceType?: string;
      referenceId?: string;
      context?: Record<string, unknown>;
    } = {},
  ) {
    const definition = await this.prisma.workflowDefinition.findFirst({
      where: {
        id: definitionId,
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        isActive: true,
      },
    });

    if (!definition) {
      throw new NotFoundException('Workflow definition not found');
    }

    const steps = resolveWorkflowSteps(
      definition.code,
      definition.bpmnXml,
      definition.slaMinutes,
    );

    if (steps.length === 0) {
      throw new BadRequestException(
        'Workflow definition has no executable steps (provide BPMN XML or use a known workflow code)',
      );
    }

    const instanceNumber = await this.nextInstanceNumber(ctx.tenantId);
    const startedAt = new Date();
    const instanceDueAt = calculateDueAt(definition.slaMinutes, startedAt);
    const firstStep = steps[0];

    const instance = await this.prisma.workflowInstance.create({
      data: {
        tenantId: ctx.tenantId,
        definitionId: definition.id,
        instanceNumber,
        status: WorkflowInstanceStatus.RUNNING,
        referenceType: options.referenceType,
        referenceId: options.referenceId,
        currentStep: firstStep.taskKey,
        dueAt: instanceDueAt,
        context: (options.context ?? {}) as object,
        tasks: {
          create: steps.map((step, index) => ({
            taskKey: step.taskKey,
            name: step.name,
            taskType: step.taskType,
            status:
              index === 0 ? WorkflowTaskStatus.ASSIGNED : WorkflowTaskStatus.PENDING,
            assignedRole: step.assignedRole,
            dueAt: calculateDueAt(step.slaMinutes, startedAt),
          })),
        },
      },
      include: { tasks: true, definition: true },
    });

    return instance;
  }

  async completeTask(
    ctx: ServiceRequestContext,
    taskId: string,
    outcome?: string,
    notes?: string,
  ) {
    const task = await this.prisma.workflowTask.findFirst({
      where: { id: taskId },
      include: {
        instance: {
          include: { definition: true, tasks: { orderBy: { taskKey: 'asc' } } },
        },
      },
    });

    if (!task || task.instance.tenantId !== ctx.tenantId) {
      throw new NotFoundException('Workflow task not found');
    }

    if (
      task.status === WorkflowTaskStatus.COMPLETED ||
      task.status === WorkflowTaskStatus.SKIPPED
    ) {
      throw new BadRequestException('Task is already completed');
    }

    const completedAt = new Date();
    await this.prisma.workflowTask.update({
      where: { id: taskId },
      data: {
        status: WorkflowTaskStatus.COMPLETED,
        completedAt,
        outcome,
        notes,
        assignedTo: task.assignedTo ?? ctx.userId,
      },
    });

    const steps = resolveWorkflowSteps(
      task.instance.definition.code,
      task.instance.definition.bpmnXml,
      task.instance.definition.slaMinutes,
    );

    const currentIndex = steps.findIndex((s) => s.taskKey === task.taskKey);
    const nextStep = currentIndex >= 0 ? steps[currentIndex + 1] : undefined;

    if (nextStep) {
      const nextTask = task.instance.tasks.find((t) => t.taskKey === nextStep.taskKey);
      if (nextTask) {
        await this.prisma.workflowTask.update({
          where: { id: nextTask.id },
          data: {
            status: WorkflowTaskStatus.ASSIGNED,
            dueAt: calculateDueAt(nextStep.slaMinutes, completedAt),
          },
        });
      }

      return this.prisma.workflowInstance.update({
        where: { id: task.instanceId },
        data: {
          status: WorkflowInstanceStatus.RUNNING,
          currentStep: nextStep.taskKey,
        },
        include: { tasks: true, definition: true },
      });
    }

    return this.prisma.workflowInstance.update({
      where: { id: task.instanceId },
      data: {
        status: WorkflowInstanceStatus.COMPLETED,
        currentStep: null,
        completedAt,
      },
      include: { tasks: true, definition: true },
    });
  }

  async escalateTask(ctx: ServiceRequestContext, taskId: string, notes?: string) {
    const task = await this.prisma.workflowTask.findFirst({
      where: { id: taskId },
      include: { instance: true },
    });

    if (!task || task.instance.tenantId !== ctx.tenantId) {
      throw new NotFoundException('Workflow task not found');
    }

    if (task.status === WorkflowTaskStatus.COMPLETED) {
      throw new BadRequestException('Cannot escalate a completed task');
    }

    if (!isOverdue(task.dueAt)) {
      throw new BadRequestException('Task is not overdue and cannot be escalated');
    }

    const escalatedAt = new Date();

    await this.prisma.workflowTask.update({
      where: { id: taskId },
      data: {
        status: WorkflowTaskStatus.ESCALATED,
        escalatedAt,
        notes: notes ?? task.notes,
      },
    });

    return this.prisma.workflowInstance.update({
      where: { id: task.instanceId },
      data: { status: WorkflowInstanceStatus.WAITING },
      include: { tasks: true, definition: true },
    });
  }

  async processOverdueTasks(tenantId: string) {
    const overdueTasks = await this.prisma.workflowTask.findMany({
      where: {
        status: { in: [WorkflowTaskStatus.PENDING, WorkflowTaskStatus.ASSIGNED, WorkflowTaskStatus.IN_PROGRESS] },
        dueAt: { lt: new Date() },
        instance: { tenantId },
      },
      include: { instance: true },
    });

    const results = [];
    for (const task of overdueTasks) {
      await this.prisma.workflowTask.update({
        where: { id: task.id },
        data: {
          status: WorkflowTaskStatus.ESCALATED,
          escalatedAt: new Date(),
        },
      });
      await this.prisma.workflowInstance.update({
        where: { id: task.instanceId },
        data: { status: WorkflowInstanceStatus.WAITING },
      });
      results.push(task.id);
    }

    return { escalatedCount: results.length, taskIds: results };
  }

  private async nextInstanceNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.workflowInstance.count({ where: { tenantId } });
    return `WF-${String(count + 1).padStart(6, '0')}`;
  }
}
