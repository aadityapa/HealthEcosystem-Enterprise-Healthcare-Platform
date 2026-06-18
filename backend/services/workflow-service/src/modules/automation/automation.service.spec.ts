import { NotFoundException } from '@nestjs/common';
import { AutomationService } from './automation.service';

describe('AutomationService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    automationRule: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: AutomationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AutomationService(prisma as never);
  });

  it('creates automation rule with trigger event', async () => {
    prisma.automationRule.create.mockResolvedValue({
      id: 'rule-1',
      triggerEvent: 'result.critical',
      workflowCode: 'critical-result',
    });

    const result = await service.create(ctx, {
      name: 'Critical Result Auto-Start',
      triggerEvent: 'result.critical',
      workflowCode: 'critical-result',
      conditions: { flag: 'CRITICAL_HIGH' },
    });

    expect(result.workflowCode).toBe('critical-result');
    expect(prisma.automationRule.create).toHaveBeenCalled();
  });

  it('finds active rules by trigger event', async () => {
    prisma.automationRule.findMany.mockResolvedValue([{ id: 'rule-1' }]);

    const result = await service.findByTrigger(ctx, 'result.critical');

    expect(result).toHaveLength(1);
  });

  it('throws NotFoundException when rule is missing', async () => {
    prisma.automationRule.findFirst.mockResolvedValue(null);

    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
