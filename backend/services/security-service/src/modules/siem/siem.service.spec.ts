import { Test, TestingModule } from '@nestjs/testing';
import { SiemService } from './siem.service';
import { PRISMA } from '@/database/database.module';

describe('SiemService', () => {
  let service: SiemService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      siemEvent: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SiemService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(SiemService);
  });

  it('ingests SIEM events', async () => {
    prisma.siemEvent.create.mockResolvedValue({ id: 'evt-1' });

    const result = await service.ingest(ctx, [
      {
        eventType: 'auth.login',
        source: 'auth',
        severity: 'info',
        message: 'User logged in',
      },
    ]);

    expect(result.ingested).toBe(1);
    expect(prisma.siemEvent.create).toHaveBeenCalled();
  });

  it('lists ingested events', async () => {
    prisma.siemEvent.findMany.mockResolvedValue([{ id: 'evt-1' }]);
    prisma.siemEvent.count.mockResolvedValue(1);

    const result = await service.listEvents(ctx, { page: 1, limit: 20 });
    expect(result.items).toHaveLength(1);
  });
});
