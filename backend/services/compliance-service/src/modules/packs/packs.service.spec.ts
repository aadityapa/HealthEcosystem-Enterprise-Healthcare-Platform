import { Test, TestingModule } from '@nestjs/testing';
import { PacksService } from './packs.service';
import { PRISMA } from '@/database/database.module';

describe('PacksService', () => {
  let service: PacksService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      compliancePack: { findMany: jest.fn() },
    };

    prisma.compliancePack.findMany.mockResolvedValue([
      { framework: 'HIPAA', name: 'HIPAA', controls: [] },
      { framework: 'GDPR', name: 'GDPR', controls: [] },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [PacksService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(PacksService);
  });

  it('lists active compliance packs', async () => {
    const result = await service.list();
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
  });
});
