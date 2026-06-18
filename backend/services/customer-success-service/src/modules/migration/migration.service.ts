import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateMigrationJobDto, ListMigrationJobsQueryDto } from './dto/migration.dto';

@Injectable()
export class MigrationService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  private async nextJobNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.dataImportJob.count({ where: { tenantId } });
    return `IMP${String(count + 1).padStart(6, '0')}`;
  }

  async createJob(ctx: ServiceRequestContext, dto: CreateMigrationJobDto) {
    const jobNumber = await this.nextJobNumber(ctx.tenantId);

    return this.prisma.dataImportJob.create({
      data: {
        tenantId: ctx.tenantId,
        jobNumber,
        importType: dto.importType,
        status: 'pending',
      },
    });
  }

  async listJobs(
    ctx: ServiceRequestContext,
    query: ListMigrationJobsQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where = {
      tenantId: ctx.tenantId,
      ...(query.status && { status: query.status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.dataImportJob.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataImportJob.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getJob(ctx: ServiceRequestContext, id: string) {
    const job = await this.prisma.dataImportJob.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!job) throw new NotFoundException('Import job not found');
    return job;
  }
}
