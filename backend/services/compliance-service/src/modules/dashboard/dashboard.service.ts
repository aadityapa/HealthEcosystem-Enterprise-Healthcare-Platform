import { Inject, Injectable } from '@nestjs/common';
import type { ControlStatus, PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';

const STATUS_SCORES: Record<ControlStatus, number> = {
  COMPLIANT: 100,
  PARTIAL: 50,
  NON_COMPLIANT: 0,
  NOT_APPLICABLE: 0,
};

@Injectable()
export class DashboardService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async getOverview() {
    const packs = await this.prisma.compliancePack.findMany({
      where: { isActive: true },
      include: { controls: true },
      orderBy: { framework: 'asc' },
    });

    const frameworks = packs.map((pack) => {
      const applicable = pack.controls.filter((c) => c.status !== 'NOT_APPLICABLE');
      const totalControls = applicable.length;
      const score =
        totalControls === 0
          ? 0
          : Math.round(
              applicable.reduce((sum, c) => sum + STATUS_SCORES[c.status], 0) /
                totalControls,
            );

      const byStatus = pack.controls.reduce(
        (acc, c) => {
          acc[c.status] = (acc[c.status] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        framework: pack.framework,
        name: pack.name,
        score,
        totalControls: pack.controls.length,
        byStatus,
      };
    });

    const overallScore =
      frameworks.length === 0
        ? 0
        : Math.round(
            frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length,
          );

    return {
      overallScore,
      frameworks,
      generatedAt: new Date().toISOString(),
    };
  }
}
