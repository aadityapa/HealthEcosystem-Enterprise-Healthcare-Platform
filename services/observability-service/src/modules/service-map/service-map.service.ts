import { Inject, Injectable } from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';

export interface ServiceMapEdge {
  source: string;
  target: string;
  callCount: number;
}

export interface ServiceMapNode {
  serviceName: string;
  spanCount: number;
}

export interface ServiceMapGraph {
  nodes: ServiceMapNode[];
  edges: ServiceMapEdge[];
}

@Injectable()
export class ServiceMapService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async buildGraph(sinceHours = 24): Promise<ServiceMapGraph> {
    const since = new Date();
    since.setHours(since.getHours() - sinceHours);

    const spans = await this.prisma.traceSpan.findMany({
      where: { startedAt: { gte: since } },
      select: {
        traceId: true,
        spanId: true,
        parentSpanId: true,
        serviceName: true,
      },
    });

    const spanById = new Map(spans.map((s) => [s.spanId, s]));
    const nodeCounts = new Map<string, number>();
    const edgeCounts = new Map<string, number>();

    for (const span of spans) {
      nodeCounts.set(span.serviceName, (nodeCounts.get(span.serviceName) ?? 0) + 1);

      if (span.parentSpanId) {
        const parent = spanById.get(span.parentSpanId);
        if (parent && parent.serviceName !== span.serviceName) {
          const key = `${parent.serviceName}::${span.serviceName}`;
          edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1);
        }
      }
    }

    const nodes: ServiceMapNode[] = [...nodeCounts.entries()].map(
      ([serviceName, spanCount]) => ({ serviceName, spanCount }),
    );

    const edges: ServiceMapEdge[] = [...edgeCounts.entries()].map(([key, callCount]) => {
      const [source, target] = key.split('::');
      return { source, target, callCount };
    });

    return { nodes, edges };
  }
}
