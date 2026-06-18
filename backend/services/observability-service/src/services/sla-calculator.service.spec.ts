import { Test, TestingModule } from '@nestjs/testing';
import { SlaStatus } from '@health/db';
import { SlaCalculatorService } from './sla-calculator.service';
import { PRISMA } from '@/database/database.module';

describe('SlaCalculatorService', () => {
  let service: SlaCalculatorService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      slaDefinition: { findUnique: jest.fn() },
      serviceHealthSnapshot: { findMany: jest.fn() },
      errorBudget: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlaCalculatorService,
        { provide: PRISMA, useValue: prisma },
      ],
    }).compile();

    service = module.get(SlaCalculatorService);
  });

  it('computes healthy budget when no snapshots exist', async () => {
    prisma.slaDefinition.findUnique.mockResolvedValue({
      id: 'sla-1',
      serviceName: 'lims-service',
      targetUptime: 0.999,
      errorBudgetPct: 0.1,
      windowDays: 30,
    });
    prisma.serviceHealthSnapshot.findMany.mockResolvedValue([]);

    const result = await service.computeForSla('sla-1');

    expect(result.status).toBe(SlaStatus.HEALTHY);
    expect(result.budgetTotal).toBe(0.1);
    expect(result.budgetConsumed).toBe(0);
  });

  it('marks budget at risk when consumption exceeds 50%', async () => {
    prisma.slaDefinition.findUnique.mockResolvedValue({
      id: 'sla-1',
      serviceName: 'lims-service',
      targetUptime: 0.999,
      errorBudgetPct: 1,
      windowDays: 30,
    });
    prisma.serviceHealthSnapshot.findMany.mockResolvedValue([
      { errorRate: 0.02 },
      { errorRate: 0.02 },
    ]);

    const result = await service.computeForSla('sla-1');

    expect(result.status).toBe(SlaStatus.AT_RISK);
    expect(result.errorRatePct).toBe(2);
  });

  it('creates error budget record when none exists', async () => {
    prisma.slaDefinition.findUnique.mockResolvedValue({
      id: 'sla-1',
      serviceName: 'lims-service',
      targetUptime: 0.999,
      errorBudgetPct: 0.5,
      windowDays: 7,
    });
    prisma.serviceHealthSnapshot.findMany.mockResolvedValue([]);
    prisma.errorBudget.findFirst.mockResolvedValue(null);
    prisma.errorBudget.create.mockResolvedValue({ id: 'budget-1', status: SlaStatus.HEALTHY });

    const result = await service.refreshErrorBudget('sla-1');

    expect(result?.id).toBe('budget-1');
    expect(prisma.errorBudget.create).toHaveBeenCalled();
  });

  it('updates existing error budget record', async () => {
    prisma.slaDefinition.findUnique.mockResolvedValue({
      id: 'sla-1',
      serviceName: 'lims-service',
      targetUptime: 0.999,
      errorBudgetPct: 0.5,
      windowDays: 7,
    });
    prisma.serviceHealthSnapshot.findMany.mockResolvedValue([{ errorRate: 0.05 }]);
    prisma.errorBudget.findFirst.mockResolvedValue({ id: 'budget-1' });
    prisma.errorBudget.update.mockResolvedValue({ id: 'budget-1', status: SlaStatus.BREACHED });

    const result = await service.refreshErrorBudget('sla-1');

    expect(prisma.errorBudget.update).toHaveBeenCalled();
    expect(result?.status).toBe(SlaStatus.BREACHED);
  });
});
