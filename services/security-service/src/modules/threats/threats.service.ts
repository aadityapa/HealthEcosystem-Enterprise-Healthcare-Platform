import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@/common/dto/pagination.dto';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ThreatDetectorService } from '@/services/threat-detector.service';
import { DetectThreatsDto } from './dto/threats.dto';

@Injectable()
export class ThreatsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly threatDetector: ThreatDetectorService,
  ) {}

  async list(ctx: ServiceRequestContext, query: PaginationDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = { tenantId: ctx.tenantId };

    const [items, total] = await Promise.all([
      this.prisma.threatDetection.findMany({
        where,
        skip,
        take,
        orderBy: { detectedAt: 'desc' },
      }),
      this.prisma.threatDetection.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async detect(ctx: ServiceRequestContext, dto: DetectThreatsDto) {
    const detections = this.threatDetector.detect(dto.events);
    const created = [];

    for (const detection of detections) {
      const record = await this.prisma.threatDetection.create({
        data: {
          tenantId: ctx.tenantId,
          ruleName: detection.ruleName,
          threatLevel: detection.threatLevel,
          source: detection.source,
          description: detection.description,
          rawEvent: detection.rawEvent as Prisma.InputJsonValue,
        },
      });
      created.push(record);
    }

    return {
      detected: created.length,
      threats: created,
      frameworks: ['ISO 27001', 'SOC 2', 'HIPAA'],
    };
  }

  async acknowledge(ctx: ServiceRequestContext, id: string) {
    const threat = await this.prisma.threatDetection.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!threat) throw new NotFoundException('Threat not found');

    return this.prisma.threatDetection.update({
      where: { id },
      data: { isAcknowledged: true },
    });
  }
}
