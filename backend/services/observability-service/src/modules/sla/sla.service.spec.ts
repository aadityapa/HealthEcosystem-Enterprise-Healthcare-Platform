import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SlaService } from './sla.service';
import { SlaCalculatorService } from '@/services/sla-calculator.service';
import { PRISMA } from '@/database/database.module';

describe('SlaService', () => {
  let service: SlaService;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let slaCalculator: { refreshErrorBudget: jest.Mock };

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      slaDefinition: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      errorBudget: { findMany: jest.fn(), count: jest.fn() },
    };
    slaCalculator = { refreshErrorBudget: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlaService,
        { provide: PRISMA, useValue: prisma },
        { provide: SlaCalculatorService, useValue: slaCalculator },
      ],
    }).compile();

    service = module.get(SlaService);
  });

  it('creates SLA and refreshes error budget', async () => {
    prisma.slaDefinition.create.mockResolvedValue({ id: 'sla-1', name: 'LIMS SLA' });

    const result = await service.create(ctx, {
      name: 'LIMS SLA',
      serviceName: 'lims-service',
      targetUptime: 0.999,
      targetLatencyMs: 200,
      errorBudgetPct: 0.1,
    });

    expect(result.name).toBe('LIMS SLA');
    expect(slaCalculator.refreshErrorBudget).toHaveBeenCalledWith('sla-1');
  });

  it('throws when SLA not found', async () => {
    prisma.slaDefinition.findFirst.mockResolvedValue(null);

    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });

  it('lists error budgets for tenant SLAs', async () => {
    prisma.slaDefinition.findMany.mockResolvedValue([{ id: 'sla-1' }]);
    prisma.errorBudget.findMany.mockResolvedValue([{ id: 'budget-1' }]);
    prisma.errorBudget.count.mockResolvedValue(1);

    const result = await service.listErrorBudgets(ctx, {});

    expect(result.items).toHaveLength(1);
  });
});
