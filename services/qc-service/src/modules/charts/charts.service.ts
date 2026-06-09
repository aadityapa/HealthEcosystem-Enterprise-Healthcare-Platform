import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';

@Injectable()
export class ChartsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async getLeveyJennings(ctx: ServiceRequestContext, materialId: string, limit = 50) {
    const material = await this.prisma.qcMaterial.findFirst({
      where: { id: materialId, tenantId: ctx.tenantId },
    });
    if (!material) throw new NotFoundException('QC material not found');

    const mean = Number(material.targetMean);
    const sd = Number(material.targetSd);

    const dataPoints = await this.prisma.qcDataPoint.findMany({
      where: {
        run: {
          tenantId: ctx.tenantId,
          materialId,
        },
      },
      orderBy: { recordedAt: 'asc' },
      take: limit,
      include: {
        run: { select: { id: true, runNumber: true, runAt: true } },
      },
    });

    return {
      material: {
        id: material.id,
        code: material.code,
        name: material.name,
        analyte: material.analyte,
        level: material.level,
        unit: material.unit,
      },
      controlLimits: {
        mean,
        sd,
        plus1Sd: mean + sd,
        minus1Sd: mean - sd,
        plus2Sd: mean + 2 * sd,
        minus2Sd: mean - 2 * sd,
        plus3Sd: mean + 3 * sd,
        minus3Sd: mean - 3 * sd,
      },
      dataPoints: dataPoints.map((dp) => ({
        id: dp.id,
        value: Number(dp.value),
        zScore: dp.zScore !== null ? Number(dp.zScore) : null,
        isOutlier: dp.isOutlier,
        recordedAt: dp.recordedAt,
        run: dp.run,
      })),
    };
  }
}
