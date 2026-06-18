import { Inject, Injectable } from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import {
  TopTestsQueryDto,
  parseDateRange,
} from '@/common/dto/analytics-query.dto';
import { ClickHouseService } from '@/services/clickhouse.service';

@Injectable()
export class TestsAnalyticsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly clickhouse: ClickHouseService,
  ) {}

  async getTestAnalytics(ctx: ServiceRequestContext, query: TopTestsQueryDto) {
    const { from, to } = parseDateRange(query);
    const limit = query.limit ?? 10;
    const granularity = query.granularity ?? 'daily';

    const chSql = `
      SELECT
        test_id,
        test_name,
        count() AS volume,
        toStartOfInterval(created_at, INTERVAL 1 ${granularity === 'monthly' ? 'MONTH' : 'DAY'}) AS period
      FROM analytics.fact_test_orders
      WHERE tenant_id = {tenantId:UUID}
        AND created_at >= {from:DateTime}
        AND created_at <= {to:DateTime}
      GROUP BY test_id, test_name, period
      ORDER BY volume DESC
      LIMIT {limit:UInt32}
    `;

    const { data, source } = await this.clickhouse.queryWithFallback(
      { tenantId: ctx.tenantId, userId: ctx.userId },
      'test_analytics',
      chSql,
      { tenantId: ctx.tenantId, from, to, limit },
      () => this.fetchTestsFromPostgres(ctx, from, to, limit, granularity),
    );

    return {
      topTests: Array.isArray(data) ? data : data.topTests,
      volumeTrends: Array.isArray(data) ? [] : data.volumeTrends,
      source,
      period: { from: from.toISOString(), to: to.toISOString() },
    };
  }

  private async fetchTestsFromPostgres(
    ctx: ServiceRequestContext,
    from: Date,
    to: Date,
    limit: number,
    granularity: 'daily' | 'monthly',
  ) {
    const items = await this.prisma.labOrderItem.findMany({
      where: {
        tenantId: ctx.tenantId,
        labOrder: { createdAt: { gte: from, lte: to } },
      },
      select: {
        testId: true,
        itemName: true,
        quantity: true,
        labOrder: { select: { createdAt: true } },
      },
    });

    const volumeByTest = new Map<string, { testId: string | null; testName: string; volume: number }>();
    const trends = new Map<string, number>();

    for (const item of items) {
      const key = item.testId ?? item.itemName;
      const existing = volumeByTest.get(key) ?? {
        testId: item.testId,
        testName: item.itemName,
        volume: 0,
      };
      existing.volume += item.quantity;
      volumeByTest.set(key, existing);

      const period = this.truncateDate(item.labOrder.createdAt, granularity);
      const trendKey = `${key}|${period}`;
      trends.set(trendKey, (trends.get(trendKey) ?? 0) + item.quantity);
    }

    const topTests = [...volumeByTest.values()]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);

    const volumeTrends = [...trends.entries()].map(([key, volume]) => {
      const [testKey, period] = key.split('|');
      const test = volumeByTest.get(testKey);
      return {
        testId: test?.testId,
        testName: test?.testName ?? testKey,
        period,
        volume,
      };
    });

    return { topTests, volumeTrends };
  }

  private truncateDate(date: Date, granularity: 'daily' | 'monthly'): string {
    if (granularity === 'monthly') {
      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    }
    return date.toISOString().slice(0, 10);
  }
}
