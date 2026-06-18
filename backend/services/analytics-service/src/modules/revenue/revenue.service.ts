import { Inject, Injectable } from '@nestjs/common';
import { InvoiceStatus, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import {
  TrendQueryDto,
  parseDateRange,
  toNumber,
} from '@/common/dto/analytics-query.dto';
import { ClickHouseService } from '@/services/clickhouse.service';

@Injectable()
export class RevenueService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly clickhouse: ClickHouseService,
  ) {}

  async getRevenueAnalytics(ctx: ServiceRequestContext, query: TrendQueryDto) {
    const { from, to } = parseDateRange(query);
    const granularity = query.granularity ?? 'daily';

    const chSql = `
      SELECT
        toStartOfInterval(created_at, INTERVAL 1 ${granularity === 'monthly' ? 'MONTH' : 'DAY'}) AS period,
        sum(total_amount) AS revenue,
        branch_id
      FROM analytics.fact_invoices
      WHERE tenant_id = {tenantId:UUID}
        AND created_at >= {from:DateTime}
        AND created_at <= {to:DateTime}
      GROUP BY period, branch_id
      ORDER BY period
    `;

    const { data, source } = await this.clickhouse.queryWithFallback(
      { tenantId: ctx.tenantId, userId: ctx.userId },
      'revenue_trends',
      chSql,
      { tenantId: ctx.tenantId, from, to },
      () => this.fetchRevenueFromPostgres(ctx, from, to, granularity),
    );

    return {
      trends: data,
      byBranch: Array.isArray(data) ? this.groupByBranch(data) : data.byBranch,
      source,
      granularity,
      period: { from: from.toISOString(), to: to.toISOString() },
    };
  }

  private groupByBranch(rows: Array<{ branch_id?: string; branchId?: string; revenue?: number }>) {
    const map = new Map<string, { branchId: string; revenue: number }>();
    for (const row of rows) {
      const branchId = row.branch_id ?? row.branchId ?? 'unknown';
      const existing = map.get(branchId) ?? { branchId, revenue: 0 };
      existing.revenue += Number(row.revenue ?? 0);
      map.set(branchId, existing);
    }
    return [...map.values()];
  }

  private async fetchRevenueFromPostgres(
    ctx: ServiceRequestContext,
    from: Date,
    to: Date,
    granularity: 'daily' | 'monthly',
  ) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        status: { notIn: [InvoiceStatus.VOID, InvoiceStatus.DRAFT] },
        createdAt: { gte: from, lte: to },
      },
      select: {
        branchId: true,
        totalAmount: true,
        createdAt: true,
      },
    });

    const trends = new Map<string, RevenueRow>();
    const byBranch = new Map<string, number>();

    for (const invoice of invoices) {
      const period = this.truncateDate(invoice.createdAt, granularity);
      const key = `${period}|${invoice.branchId}`;
      const existing = trends.get(key) ?? {
        period,
        branchId: invoice.branchId,
        revenue: 0,
      };
      existing.revenue += toNumber(invoice.totalAmount);
      trends.set(key, existing);

      byBranch.set(
        invoice.branchId,
        (byBranch.get(invoice.branchId) ?? 0) + toNumber(invoice.totalAmount),
      );
    }

    return {
      trends: [...trends.values()].sort((a, b) => a.period.localeCompare(b.period)),
      byBranch: [...byBranch.entries()].map(([branchId, revenue]) => ({
        branchId,
        revenue,
      })),
    };
  }

  private truncateDate(date: Date, granularity: 'daily' | 'monthly'): string {
    if (granularity === 'monthly') {
      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    }
    return date.toISOString().slice(0, 10);
  }
}

interface RevenueRow {
  period: string;
  branchId: string;
  revenue: number;
}
