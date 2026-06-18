import { Inject, Injectable } from '@nestjs/common';
import { QcRunStatus, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import {
  BranchFilterQueryDto,
  parseDateRange,
} from '@/common/dto/analytics-query.dto';
import { ClickHouseService } from '@/services/clickhouse.service';

@Injectable()
export class QcAnalyticsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly clickhouse: ClickHouseService,
  ) {}

  async getQcAnalytics(ctx: ServiceRequestContext, query: BranchFilterQueryDto) {
    const { from, to } = parseDateRange(query);
    const chSql = `
      SELECT
        countIf(status = 'FAILED') AS failed_runs,
        count() AS total_runs,
        countIf(has_violation = 1) AS violation_count
      FROM analytics.fact_qc_runs
      WHERE tenant_id = {tenantId:UUID}
        AND run_at >= {from:DateTime}
        AND run_at <= {to:DateTime}
        ${query.branchId ? 'AND branch_id = {branchId:UUID}' : ''}
    `;

    const { data, source } = await this.clickhouse.queryWithFallback(
      { tenantId: ctx.tenantId, userId: ctx.userId },
      'qc_analytics',
      chSql,
      { tenantId: ctx.tenantId, from, to, branchId: query.branchId },
      () => this.fetchQcFromPostgres(ctx, from, to, query.branchId),
    );

    const payload = Array.isArray(data) ? data[0] : data;
    return {
      failureRate: payload.failureRate,
      failedRuns: payload.failedRuns,
      totalRuns: payload.totalRuns,
      violations: payload.violations,
      violationsByRule: payload.violationsByRule,
      source,
      period: { from: from.toISOString(), to: to.toISOString() },
    };
  }

  private async fetchQcFromPostgres(
    ctx: ServiceRequestContext,
    from: Date,
    to: Date,
    branchId?: string,
  ) {
    const runWhere = {
      tenantId: ctx.tenantId,
      runAt: { gte: from, lte: to },
      ...(branchId && { branchId }),
    };

    const [totalRuns, failedRuns, violations, violationsByRule] = await Promise.all([
      this.prisma.qcRun.count({ where: runWhere }),
      this.prisma.qcRun.count({
        where: { ...runWhere, status: QcRunStatus.FAILED },
      }),
      this.prisma.westgardViolation.count({
        where: {
          run: runWhere,
        },
      }),
      this.prisma.westgardViolation.groupBy({
        by: ['ruleCode'],
        where: { run: runWhere },
        _count: { _all: true },
      }),
    ]);

    const failureRate = totalRuns > 0 ? (failedRuns / totalRuns) * 100 : 0;

    return {
      totalRuns,
      failedRuns,
      failureRate: Math.round(failureRate * 100) / 100,
      violations,
      violationsByRule: violationsByRule.map((v) => ({
        ruleCode: v.ruleCode,
        count: v._count._all,
      })),
    };
  }
}
