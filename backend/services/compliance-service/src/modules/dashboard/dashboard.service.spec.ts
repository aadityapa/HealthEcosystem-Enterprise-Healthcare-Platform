import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PRISMA } from '@/database/database.module';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      compliancePack: { findMany: jest.fn() },
    };

    prisma.compliancePack.findMany.mockResolvedValue([
      {
        framework: 'HIPAA',
        name: 'HIPAA Security & Privacy',
        controls: [
          { status: 'COMPLIANT' },
          { status: 'PARTIAL' },
          { status: 'NON_COMPLIANT' },
        ],
      },
      {
        framework: 'ISO_27001',
        name: 'ISO/IEC 27001',
        controls: [
          { status: 'COMPLIANT' },
          { status: 'COMPLIANT' },
        ],
      },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(DashboardService);
  });

  it('returns overall score per framework', async () => {
    const result = await service.getOverview();

    expect(result.frameworks).toHaveLength(2);
    expect(result.frameworks[0].score).toBeDefined();
    expect(result.overallScore).toBeGreaterThan(0);
  });

  it('calculates HIPAA score from control statuses', async () => {
    const result = await service.getOverview();
    const hipaa = result.frameworks.find((f) => f.framework === 'HIPAA');

    expect(hipaa?.score).toBe(50);
  });
});
