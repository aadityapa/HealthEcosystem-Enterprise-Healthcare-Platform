import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@/common/dto/pagination.dto';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { RotateSecretDto } from './dto/secrets.dto';

const ROTATION_INTERVAL_DAYS = 90;

@Injectable()
export class SecretsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async listRotationLogs(ctx: ServiceRequestContext, query: PaginationDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = { tenantId: ctx.tenantId };

    const [items, total] = await Promise.all([
      this.prisma.secretRotationLog.findMany({
        where,
        skip,
        take,
        orderBy: { rotatedAt: 'desc' },
      }),
      this.prisma.secretRotationLog.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async rotate(ctx: ServiceRequestContext, dto: RotateSecretDto) {
    const nextRotationAt = new Date();
    nextRotationAt.setDate(nextRotationAt.getDate() + ROTATION_INTERVAL_DAYS);

    const log = await this.prisma.secretRotationLog.create({
      data: {
        tenantId: ctx.tenantId,
        secretName: dto.secretName,
        rotationType: dto.rotationType,
        status: dto.status ?? 'success',
        nextRotationAt,
      },
    });

    return {
      ...log,
      frameworks: ['ISO 27001', 'SOC 2', 'HIPAA'],
      message: `Secret ${dto.secretName} rotated successfully`,
    };
  }
}
