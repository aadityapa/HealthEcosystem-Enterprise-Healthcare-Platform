import { Inject, Injectable } from '@nestjs/common';
import { StudyStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';

@Injectable()
export class WorklistService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async getWorklist(ctx: ServiceRequestContext, page = 1, limit = 50) {
    const { skip, take } = paginate(page, limit);
    const where = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      status: { in: [StudyStatus.SCHEDULED, StudyStatus.IN_PROGRESS] },
    };

    const [items, total] = await Promise.all([
      this.prisma.radiologyStudy.findMany({
        where,
        skip,
        take,
        orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          patientId: true,
          accessionNumber: true,
          modality: true,
          bodyPart: true,
          description: true,
          status: true,
          scheduledAt: true,
          performedAt: true,
          referringDoctor: true,
        },
      }),
      this.prisma.radiologyStudy.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }
}
