import { StudyStatus } from '@health/db';
import { WorklistService } from './worklist.service';

describe('WorklistService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    radiologyStudy: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  let service: WorklistService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WorklistService(prisma as never);
  });

  it('returns scheduled and in-progress studies', async () => {
    prisma.radiologyStudy.findMany.mockResolvedValue([
      { id: 'study-1', status: StudyStatus.SCHEDULED },
    ]);
    prisma.radiologyStudy.count.mockResolvedValue(1);

    const result = await service.getWorklist(ctx);

    expect(result.items).toHaveLength(1);
    expect(prisma.radiologyStudy.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: [StudyStatus.SCHEDULED, StudyStatus.IN_PROGRESS] },
        }),
      }),
    );
  });
});
