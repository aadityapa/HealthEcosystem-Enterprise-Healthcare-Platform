import { Inject, Injectable } from '@nestjs/common';
import { SlaStatus, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';

export interface ErrorBudgetComputation {
  budgetTotal: number;
  budgetConsumed: number;
  status: SlaStatus;
  uptimePct: number;
  errorRatePct: number;
}

@Injectable()
export class SlaCalculatorService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async computeForSla(slaId: string): Promise<ErrorBudgetComputation> {
    const sla = await this.prisma.slaDefinition.findUnique({ where: { id: slaId } });
    if (!sla) {
      throw new Error(`SLA definition ${slaId} not found`);
    }

    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - sla.windowDays);

    const snapshots = await this.prisma.serviceHealthSnapshot.findMany({
      where: {
        serviceName: sla.serviceName,
        recordedAt: { gte: windowStart },
      },
      orderBy: { recordedAt: 'desc' },
    });

    const budgetTotal = Number(sla.errorBudgetPct);
    let budgetConsumed = 0;
    let uptimePct = Number(sla.targetUptime) * 100;
    let errorRatePct = 0;

    if (snapshots.length > 0) {
      const totalErrorRate = snapshots.reduce((sum, snap) => {
        return sum + Number(snap.errorRate ?? 0);
      }, 0);
      const avgErrorRate = totalErrorRate / snapshots.length;
      errorRatePct = avgErrorRate * 100;
      uptimePct = Math.max(0, 100 - errorRatePct);
      budgetConsumed = Math.min(budgetTotal, (errorRatePct / 100) * budgetTotal * sla.windowDays);
    }

    const consumptionRatio = budgetTotal > 0 ? budgetConsumed / budgetTotal : 0;
    let status: SlaStatus = SlaStatus.HEALTHY;
    if (consumptionRatio >= 1) {
      status = SlaStatus.BREACHED;
    } else if (consumptionRatio >= 0.5) {
      status = SlaStatus.AT_RISK;
    }

    return { budgetTotal, budgetConsumed, status, uptimePct, errorRatePct };
  }

  async refreshErrorBudget(slaId: string) {
    const sla = await this.prisma.slaDefinition.findUnique({ where: { id: slaId } });
    if (!sla) return null;

    const computation = await this.computeForSla(slaId);
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - sla.windowDays);

    const existing = await this.prisma.errorBudget.findFirst({
      where: { slaId, periodStart },
      orderBy: { periodStart: 'desc' },
    });

    const data = {
      budgetTotal: computation.budgetTotal,
      budgetConsumed: computation.budgetConsumed,
      status: computation.status,
    };

    if (existing) {
      return this.prisma.errorBudget.update({ where: { id: existing.id }, data });
    }

    return this.prisma.errorBudget.create({
      data: {
        slaId,
        periodStart,
        periodEnd,
        ...data,
      },
    });
  }
}
