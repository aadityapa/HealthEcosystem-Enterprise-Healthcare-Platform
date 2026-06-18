import { Inject, Injectable } from '@nestjs/common';
import type { Prisma, PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@/common/dto/pagination.dto';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { IngestSiemEventDto } from './dto/siem.dto';

@Injectable()
export class SiemService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async ingest(ctx: ServiceRequestContext, events: IngestSiemEventDto[]) {
    const created = await Promise.all(
      events.map((event) =>
        this.prisma.siemEvent.create({
          data: {
            tenantId: ctx.tenantId,
            eventType: event.eventType,
            source: event.source,
            severity: event.severity,
            message: event.message,
            rawPayload: (event.rawPayload ?? {}) as Prisma.InputJsonValue,
          },
        }),
      ),
    );

    return { ingested: created.length, events: created };
  }

  async listEvents(ctx: ServiceRequestContext, query: PaginationDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = { tenantId: ctx.tenantId };

    const [items, total] = await Promise.all([
      this.prisma.siemEvent.findMany({
        where,
        skip,
        take,
        orderBy: { ingestedAt: 'desc' },
      }),
      this.prisma.siemEvent.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }
}
