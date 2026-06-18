import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import { OtelCollectorService } from '@/services/otel-collector.service';
import type { IngestSpansDto } from './dto/traces.dto';

@Injectable()
export class TracesService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly otelCollector: OtelCollectorService,
  ) {}

  async ingestSpans(dto: IngestSpansDto) {
    return this.otelCollector.ingestSpans(dto.spans);
  }

  async getTrace(traceId: string) {
    const spans = await this.prisma.traceSpan.findMany({
      where: { traceId },
      orderBy: { startedAt: 'asc' },
    });

    if (!spans.length) {
      throw new NotFoundException(`Trace ${traceId} not found`);
    }

    return { traceId, spans };
  }
}
