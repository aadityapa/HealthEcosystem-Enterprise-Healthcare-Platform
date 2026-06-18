import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateTrainingDto, ListTrainingQueryDto } from './dto/training.dto';

@Injectable()
export class TrainingService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateTrainingDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, tenantId: ctx.tenantId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    return this.prisma.trainingRecord.create({
      data: {
        tenantId: ctx.tenantId,
        employeeId: dto.employeeId,
        trainingName: dto.trainingName,
        provider: dto.provider,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
        expiryAt: dto.expiryAt ? new Date(dto.expiryAt) : undefined,
        certificateUrl: dto.certificateUrl,
      },
    });
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListTrainingQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where: Prisma.TrainingRecordWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.employeeId && { employeeId: filters.employeeId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.trainingRecord.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.trainingRecord.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const record = await this.prisma.trainingRecord.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!record) throw new NotFoundException('Training record not found');
    return record;
  }
}
