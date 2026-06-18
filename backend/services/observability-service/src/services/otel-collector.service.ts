import { Inject, Injectable } from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';

export interface OtelSpanInput {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  durationMs: number;
  status?: string;
  attributes?: Record<string, unknown>;
  startedAt: string;
}

export interface IngestSpansResult {
  accepted: number;
  traceIds: string[];
}

@Injectable()
export class OtelCollectorService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async ingestSpans(spans: OtelSpanInput[]): Promise<IngestSpansResult> {
    if (!spans.length) {
      return { accepted: 0, traceIds: [] };
    }

    await this.prisma.traceSpan.createMany({
      data: spans.map((span) => ({
        traceId: span.traceId,
        spanId: span.spanId,
        parentSpanId: span.parentSpanId,
        serviceName: span.serviceName,
        operationName: span.operationName,
        durationMs: span.durationMs,
        status: span.status ?? 'ok',
        attributes: (span.attributes ?? {}) as Prisma.InputJsonValue,
        startedAt: new Date(span.startedAt),
      })),
      skipDuplicates: true,
    });

    return {
      accepted: spans.length,
      traceIds: [...new Set(spans.map((s) => s.traceId))],
    };
  }
}
