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
export class ExecutiveService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly clickhouse: ClickHouseService,
  ) {}

  async getKpis(ctx: ServiceRequestContext, query: DateRangeQueryDto) {
    const { from, to } = parseDateRange(query);
    const chSql = `
      SELECT
        sum(total_amount) AS revenue,
        countDistinct(order_id) AS orders,
        countDistinct(patient_id) AS patients,
        countDistinct(branch_id) AS branches
      FROM analytics.fact_orders
      WHERE tenant_id = {tenantId:UUID}
        AND organization_id = {organizationId:UUID}
        AND created_at >= {from:DateTime}
        AND created_at <= {to:DateTime}
    `;

    const { data, source } = await this.clickhouse.queryWithFallback(
      { tenantId: ctx.tenantId, userId: ctx.userId },
      'executive_kpis',
      chSql,
      {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        from,
        to,
      },
      () => this.fetchKpisFromPostgres(ctx, from, to),
    );

    const kpis = Array.isArray(data) ? data[0] : data;

    return { kpis, source, period: { from: from.toISOString(), to: to.toISOString() } };
  }

  private async fetchKpisFromPostgres(
    ctx: ServiceRequestContext,
    from: Date,
    to: Date,
  ) {
    const invoiceWhere = {
      tenantId: ctx.tenantId,
      organizationId: ctx.organizationId,
      status: { notIn: [InvoiceStatus.VOID, InvoiceStatus.DRAFT] },
      createdAt: { gte: from, lte: to },
    };

    const [revenueAgg, orders, patients, branches] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: invoiceWhere,
        _sum: { totalAmount: true },
      }),
      this.prisma.labOrder.count({
        where: {
          tenantId: ctx.tenantId,
          organizationId: ctx.organizationId,
          createdAt: { gte: from, lte: to },
        },
      }),
      this.prisma.patient.count({
        where: {
          tenantId: ctx.tenantId,
          createdAt: { gte: from, lte: to },
        },
      }),
      this.prisma.branch.count({
        where: {
          tenantId: ctx.tenantId,
          organizationId: ctx.organizationId,
          isActive: true,
        },
      }),
    ]);

    return {
      revenue: toNumber(revenueAgg._sum.totalAmount),
      orders,
      patients,
      branches,
    };
  }
}
