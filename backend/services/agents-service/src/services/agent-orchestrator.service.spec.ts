import { NotFoundException } from '@nestjs/common';
import { AgentType } from '@/common/agent-type';
import { AgentOrchestratorService } from './agent-orchestrator.service';

describe('AgentOrchestratorService', () => {
  const ctx = {
    tenantId: '11111111-1111-1111-1111-111111111111',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    aiAgent: { upsert: jest.fn() },
    agentSession: { create: jest.fn(), findFirst: jest.fn() },
    agentMessage: { create: jest.fn() },
  };

  let service: AgentOrchestratorService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AgentOrchestratorService(prisma as never);
    prisma.aiAgent.upsert.mockResolvedValue({
      id: 'agent-1',
      agentType: AgentType.PATIENT,
      name: 'Patient Assistant',
    });
    prisma.agentSession.create.mockResolvedValue({ id: 'session-1' });
    prisma.agentMessage.create.mockResolvedValue({});
  });

  it('seeds default patient agent on invoke', async () => {
    await service.invoke(ctx, AgentType.PATIENT, { message: 'Explain my CBC report' });
    expect(prisma.aiAgent.upsert).toHaveBeenCalled();
  });

  it('creates session when sessionId omitted', async () => {
    const result = await service.invoke(ctx, AgentType.PATIENT, {
      message: 'Book a home collection',
    });
    expect(prisma.agentSession.create).toHaveBeenCalled();
    expect(result.sessionId).toBe('session-1');
  });

  it('reuses existing session when sessionId provided', async () => {
    prisma.agentSession.findFirst.mockResolvedValue({ id: 'session-existing' });
    const result = await service.invoke(ctx, AgentType.DOCTOR, {
      message: 'Summarize patient history',
      sessionId: 'session-existing',
    });
    expect(prisma.agentSession.create).not.toHaveBeenCalled();
    expect(result.sessionId).toBe('session-existing');
  });

  it('throws when session not found', async () => {
    prisma.agentSession.findFirst.mockResolvedValue(null);
    await expect(
      service.invoke(ctx, AgentType.DOCTOR, {
        message: 'test',
        sessionId: 'bad-session',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('logs user and assistant messages with tool calls', async () => {
    await service.invoke(ctx, AgentType.PATIENT, { message: 'What is my hemoglobin?' });
    expect(prisma.agentMessage.create).toHaveBeenCalledTimes(2);
    expect(prisma.agentMessage.create).toHaveBeenLastCalledWith({
      data: expect.objectContaining({
        role: 'assistant',
        toolCalls: expect.any(Array),
      }),
    });
  });

  it('routes patient agent with lookup_report tool', async () => {
    const result = await service.invoke(ctx, AgentType.PATIENT, {
      message: 'Explain report',
      patientId: 'patient-1',
    });
    expect(result.agentType).toBe(AgentType.PATIENT);
    expect(result.toolCalls[0].tool).toBe('lookup_report');
    expect(result.reply).toContain('hemoglobin');
  });

  it('routes doctor agent with clinical tools', async () => {
    const result = await service.invoke(ctx, AgentType.DOCTOR, {
      message: 'Critical values?',
    });
    expect(result.toolCalls.map((t) => t.tool)).toEqual([
      'clinical_summary',
      'prescription_draft',
    ]);
    expect(result.reply).toContain('Potassium');
  });

  it('routes lab agent with QC and device tools', async () => {
    const result = await service.invoke(ctx, AgentType.LAB, {
      message: 'Check QC run',
      context: { analyte: 'GLU' },
    });
    expect(result.toolCalls.map((t) => t.tool)).toEqual(['qc_westgard_check', 'device_status']);
    expect(result.reply).toContain('Westgard');
  });

  it('routes management agent with revenue insights', async () => {
    const result = await service.invoke(ctx, AgentType.MANAGEMENT, {
      message: 'Revenue last month?',
    });
    expect(result.toolCalls.map((t) => t.tool)).toEqual(['revenue_aggregate', 'operations_kpi']);
    expect(result.reply).toContain('Revenue');
  });
});
