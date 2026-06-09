import { ConflictException, NotFoundException } from '@nestjs/common';
import { DefinitionsService } from './definitions.service';

describe('DefinitionsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    workflowDefinition: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: DefinitionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DefinitionsService(prisma as never);
  });

  it('creates workflow definition with BPMN XML', async () => {
    prisma.workflowDefinition.findFirst.mockResolvedValue(null);
    prisma.workflowDefinition.create.mockResolvedValue({
      id: 'def-1',
      code: 'critical-result',
      bpmnXml: '<bpmn:userTask id="step1" />',
    });

    const result = await service.create(ctx, {
      code: 'critical-result',
      name: 'Critical Result Workflow',
      bpmnXml: '<bpmn:userTask id="step1" />',
      slaMinutes: 60,
    });

    expect(result.code).toBe('critical-result');
    expect(prisma.workflowDefinition.create).toHaveBeenCalled();
  });

  it('rejects duplicate workflow code', async () => {
    prisma.workflowDefinition.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create(ctx, { code: 'critical-result', name: 'Duplicate' }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when definition is missing', async () => {
    prisma.workflowDefinition.findFirst.mockResolvedValue(null);

    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });

  it('deactivates definition on remove', async () => {
    prisma.workflowDefinition.findFirst.mockResolvedValue({ id: 'def-1' });
    prisma.workflowDefinition.update.mockResolvedValue({ id: 'def-1', isActive: false });

    const result = await service.remove(ctx, 'def-1');

    expect(result.isActive).toBe(false);
  });
});
