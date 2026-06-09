import { Inject, Injectable } from '@nestjs/common';
import { InvoiceStatus, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import {
  DateRangeQueryDto,
  parseDateRange,
  toNumber,
} from '@/common/dto/analytics-query.dto';
import { ClickHouseService } from '@/services/clickhouse.service';

@Injectable()
export class BranchesService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly clickhouse: ClickHouseService,
  ) {}

  async compareBranches(ctx: ServiceRequestContext, query: DateRangeQueryDto) {
    const { from, to } = parseDateRange(query);
    const chSql = `
      SELECT
        branch_id,
        sum(total_amount) AS revenue,
        countDistinct(order_id) AS orders,
        countDistinct(patient_id) AS patients
      FROM analytics.fact_orders
      WHERE tenant_id = {tenantId:UUID}
        AND created_at >= {from:DateTime}
        AND created_at <= {to:DateTime}
      GROUP BY branch_id
      ORDER BY revenue DESC
    `;

    const { data, source } = await this.clickhouse.queryWithFallback(
      { tenantId: ctx.tenantId, userId: ctx.userId },
      'branch_comparison',
      chSql,
      { tenantId: ctx.tenantId, from, to },
      () => this.fetchBranchComparison(ctx, from, to),
    );

    return {
      branches: data,
      source,
      period: { from: from.toISOString(), to: to.toISOString() },
    };
  }

  private async fetchBranchComparison(
    ctx: ServiceRequestContext,
    from: Date,
    to: Date,
  ) {
    const branches = await this.prisma.branch.findMany({
      where: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        isActive: true,
      },
      select: { id: true, code: true, name: true },
    });

    const [orderCounts, revenueByBranch, patientCounts] = await Promise.all([
      this.prisma.labOrder.groupBy({
        by: ['branchId'],
        where: {
          tenantId: ctx.tenantId,
          createdAt: { gte: from, lte: to },
        },
        _count: { _all: true },
      }),
      this.prisma.invoice.groupBy({
        by: ['branchId'],
        where: {
          tenantId: ctx.tenantId,
          status: { notIn: [InvoiceStatus.VOID, InvoiceStatus.DRAFT] },
          createdAt: { gte: from, lte: to },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.labOrder.groupBy({
        by: ['branchId'],
        where: {
          tenantId: ctx.tenantId,
          createdAt: { gte: from, lte: to },
        },
        _count: { patientId: true },
      }),
    ]);

    const orderMap = new Map(orderCounts.map((r) => [r.branchId, r._count._all]));
    const revenueMap = new Map(
      revenueByBranch.map((r) => [r.branchId, toNumber(r._sum.totalAmount)]),
    );
    const patientMap = new Map(patientCounts.map((r) => [r.branchId, r._count.patientId]));

    return branches.map((branch) => ({
      branchId: branch.id,
      code: branch.code,
      name: branch.name,
      orders: orderMap.get(branch.id) ?? 0,
      revenue: revenueMap.get(branch.id) ?? 0,
      patients: patientMap.get(branch.id) ?? 0,
    }));
  }
}
