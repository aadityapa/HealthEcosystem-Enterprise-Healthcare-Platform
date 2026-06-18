import { Test, TestingModule } from '@nestjs/testing';
import { CompliancePackSeedService } from './compliance-pack-seed.service';
import { PRISMA } from '@/database/database.module';
import { COMPLIANCE_PACK_SEEDS } from './compliance-pack-data';

describe('CompliancePackSeedService', () => {
  let service: CompliancePackSeedService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      compliancePack: { upsert: jest.fn() },
      complianceControl: { upsert: jest.fn() },
    };

    prisma.compliancePack.upsert.mockImplementation(({ create }) =>
      Promise.resolve({ id: `pack-${create.framework}`, ...create }),
    );
    prisma.complianceControl.upsert.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompliancePackSeedService,
        { provide: PRISMA, useValue: prisma },
      ],
    }).compile();

    service = module.get(CompliancePackSeedService);
  });

  it('seeds all 8 compliance frameworks', async () => {
    const result = await service.seedCompliancePacks();
    expect(result).toHaveLength(8);
    expect(prisma.compliancePack.upsert).toHaveBeenCalledTimes(8);
  });

  it('includes HIPAA, GDPR, DPDP, ISO_27001, NABL, CAP, ABDM frameworks', () => {
    const frameworks = COMPLIANCE_PACK_SEEDS.map((p) => p.framework);
    expect(frameworks).toContain('HIPAA');
    expect(frameworks).toContain('GDPR');
    expect(frameworks).toContain('DPDP');
    expect(frameworks).toContain('ISO_27001');
    expect(frameworks).toContain('NABL');
    expect(frameworks).toContain('CAP');
    expect(frameworks).toContain('ABDM');
  });
});
