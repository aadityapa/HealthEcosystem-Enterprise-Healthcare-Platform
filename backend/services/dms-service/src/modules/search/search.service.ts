import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DocumentStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';

@Injectable()
export class SearchService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async search(
    ctx: ServiceRequestContext,
    query: string,
    page = 1,
    limit = 20,
  ) {
    const trimmed = query?.trim();
    if (!trimmed) {
      throw new BadRequestException('Search query parameter "q" is required');
    }

    const { skip, take } = paginate(page, limit);
    const where = {
      tenantId: ctx.tenantId,
      organizationId: ctx.organizationId,
      status: { not: DocumentStatus.DELETED },
      OR: [
        { title: { contains: trimmed, mode: 'insensitive' as const } },
        { ocrText: { contains: trimmed, mode: 'insensitive' as const } },
      ],
    };

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take), query: trimmed };
  }
}
