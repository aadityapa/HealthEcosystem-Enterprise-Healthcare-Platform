import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { AgentType, type AgentTypeValue } from '@/common/agent-type';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { DEFAULT_AGENT_PROMPTS } from './default-prompts';

export interface AgentInvokeDto {
  message: string;
  sessionId?: string;
  patientId?: string;
  context?: Record<string, unknown>;
}

export interface AgentInvokeResult {
  sessionId: string;
  agentId: string;
  agentType: AgentTypeValue;
  reply: string;
  toolCalls: Array<{ tool: string; input: unknown; output: unknown }>;
}

@Injectable()
export class AgentOrchestratorService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async ensureDefaultAgent(ctx: ServiceRequestContext, agentType: AgentTypeValue) {
    const defaults = DEFAULT_AGENT_PROMPTS[agentType];
    return this.prisma.aiAgent.upsert({
      where: {
        tenantId_agentType_name: {
          tenantId: ctx.tenantId,
          agentType,
          name: defaults.name,
        },
      },
      create: {
        tenantId: ctx.tenantId,
        agentType,
        name: defaults.name,
        description: defaults.description,
        systemPrompt: defaults.systemPrompt,
        capabilities: defaults.capabilities,
        modelKey: 'rule-based-v1',
      },
      update: {},
    });
  }

  async invoke(
    ctx: ServiceRequestContext,
    agentType: AgentTypeValue,
    dto: AgentInvokeDto,
  ): Promise<AgentInvokeResult> {
    const agent = await this.ensureDefaultAgent(ctx, agentType);

    let sessionId = dto.sessionId;
    if (!sessionId) {
      const session = await this.prisma.agentSession.create({
        data: {
          tenantId: ctx.tenantId,
          agentId: agent.id,
          userId: ctx.userId,
          patientId: dto.patientId,
          context: (dto.context ?? {}) as object,
        },
      });
      sessionId = session.id;
    } else {
      const existing = await this.prisma.agentSession.findFirst({
        where: { id: sessionId, tenantId: ctx.tenantId, agentId: agent.id },
      });
      if (!existing) throw new NotFoundException('Agent session not found');
    }

    await this.prisma.agentMessage.create({
      data: { sessionId, role: 'user', content: dto.message },
    });

    const { reply, toolCalls } = this.routeToHandler(agentType, dto.message, dto.context);

    await this.prisma.agentMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: reply,
        toolCalls: toolCalls as object,
      },
    });

    return { sessionId, agentId: agent.id, agentType, reply, toolCalls };
  }

  private routeToHandler(
    agentType: AgentTypeValue,
    message: string,
    context?: Record<string, unknown>,
  ): { reply: string; toolCalls: AgentInvokeResult['toolCalls'] } {
    switch (agentType) {
      case AgentType.PATIENT:
        return this.handlePatient(message, context);
      case AgentType.DOCTOR:
        return this.handleDoctor(message, context);
      case AgentType.LAB:
        return this.handleLab(message, context);
      case AgentType.MANAGEMENT:
        return this.handleManagement(message, context);
      default:
        return { reply: 'Agent type not supported.', toolCalls: [] };
    }
  }

  private handlePatient(message: string, context?: Record<string, unknown>) {
    const toolCalls = [
      {
        tool: 'lookup_report',
        input: { query: message, patientId: context?.patientId },
        output: { summary: 'Hemoglobin within normal range (13.2 g/dL).' },
      },
    ];
    const reply =
      'Your hemoglobin level is within the normal range. Would you like help booking a follow-up test or scheduling home collection?';
    return { reply, toolCalls };
  }

  private handleDoctor(message: string, context?: Record<string, unknown>) {
    const toolCalls = [
      {
        tool: 'clinical_summary',
        input: { query: message, patientId: context?.patientId },
        output: { abnormalCount: 2, critical: ['Potassium 6.1 mmol/L'] },
      },
      {
        tool: 'prescription_draft',
        input: { condition: 'hyperkalemia' },
        output: { suggestion: 'Review medications; consider repeat K+ and ECG.' },
      },
    ];
    const reply =
      'Clinical summary: 2 abnormal results flagged. Critical: Potassium 6.1 mmol/L. Draft recommendation: review medications and repeat potassium with ECG.';
    return { reply, toolCalls };
  }

  private handleLab(message: string, context?: Record<string, unknown>) {
    const toolCalls = [
      {
        tool: 'qc_westgard_check',
        input: { analyte: context?.analyte ?? 'GLU', runId: context?.runId },
        output: { rule: '1-2s', violated: true, action: 'repeat_run' },
      },
      {
        tool: 'device_status',
        input: { deviceId: context?.deviceId ?? 'analyzer-01' },
        output: { status: 'online', lastCalibration: '2026-06-01' },
      },
    ];
    const reply =
      'QC analysis: 1-2s Westgard rule violated for glucose — recommend repeat run. Device analyzer-01 is online; last calibration 2026-06-01.';
    return { reply, toolCalls };
  }

  private handleManagement(message: string, _context?: Record<string, unknown>) {
    const toolCalls = [
      {
        tool: 'revenue_aggregate',
        input: { period: 'last_30_days', query: message },
        output: { revenue: 4250000, growthPct: 8.2, currency: 'INR' },
      },
      {
        tool: 'operations_kpi',
        input: { metric: 'tat_hours' },
        output: { avgTat: 4.6, target: 6, branchesBelowTarget: 2 },
      },
    ];
    const reply =
      'Revenue last 30 days: ₹42.5L (+8.2%). Average TAT 4.6h (target 6h). Two branches below TAT target — review staffing on night shift.';
    return { reply, toolCalls };
  }
}
