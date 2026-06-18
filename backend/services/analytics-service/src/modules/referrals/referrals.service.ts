import { Inject, Injectable } from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import {
  DateRangeQueryDto,
  parseDateRange,
  toNumber,
} from '@/common/dto/analytics-query.dto';
import { ClickHouseService } from '@/services/clickhouse.service';

@Injectable()
export class ReferralsAnalyticsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly clickhouse: ClickHouseService,
  ) {}

  async getReferralStats(ctx: ServiceRequestContext, query: DateRangeQueryDto) {
    const { from, to } = parseDateRange(query);
    const chSql = `
      SELECT
        doctor_id,
        doctor_name,
        count() AS referral_count,
        sum(order_amount) AS total_order_amount,
        sum(commission_amount) AS total_commission
      FROM analytics.fact_referrals
      WHERE tenant_id = {tenantId:UUID}
        AND referred_at >= {from:DateTime}
        AND referred_at <= {to:DateTime}
      GROUP BY doctor_id, doctor_name
      ORDER BY referral_count DESC
    `;

    const { data, source } = await this.clickhouse.queryWithFallback(
      { tenantId: ctx.tenantId, userId: ctx.userId },
      'referral_stats',
      chSql,
      { tenantId: ctx.tenantId, from, to },
      () => this.fetchReferralsFromPostgres(ctx, from, to),
    );

    const stats = Array.isArray(data) ? data : data.doctors;
    const summary = Array.isArray(data)
      ? {
          totalReferrals: stats.reduce(
            (sum: number, row: ReferralRow) => sum + Number(row.referral_count ?? row.referralCount ?? 0),
            0,
          ),
          totalOrderAmount: stats.reduce(
            (sum: number, row: ReferralRow) =>
              sum + Number(row.total_order_amount ?? row.totalOrderAmount ?? 0),
            0,
          ),
          totalCommission: stats.reduce(
            (sum: number, row: ReferralRow) =>
              sum + Number(row.total_commission ?? row.totalCommission ?? 0),
            0,
          ),
        }
      : data.summary;

    return {
      doctors: stats,
      summary,
      source,
      period: { from: from.toISOString(), to: to.toISOString() },
    };
  }

  private async fetchReferralsFromPostgres(
    ctx: ServiceRequestContext,
    from: Date,
    to: Date,
  ) {
    const referrals = await this.prisma.doctorReferral.findMany({
      where: {
        tenantId: ctx.tenantId,
        referredAt: { gte: from, lte: to },
      },
      include: {
        doctor: { select: { id: true, name: true } },
      },
    });

    const byDoctor = new Map<
      string,
      {
        doctorId: string;
        doctorName: string;
        referralCount: number;
        totalOrderAmount: number;
        totalCommission: number;
      }
    >();

    for (const referral of referrals) {
      const existing = byDoctor.get(referral.doctorId) ?? {
        doctorId: referral.doctorId,
        doctorName: referral.doctor.name,
        referralCount: 0,
        totalOrderAmount: 0,
        totalCommission: 0,
      };
      existing.referralCount += 1;
      existing.totalOrderAmount += toNumber(referral.orderAmount);
      existing.totalCommission += toNumber(referral.commissionAmount);
      byDoctor.set(referral.doctorId, existing);
    }

    const doctors = [...byDoctor.values()].sort(
      (a, b) => b.referralCount - a.referralCount,
    );

    return {
      doctors,
      summary: {
        totalReferrals: referrals.length,
        totalOrderAmount: doctors.reduce((s, d) => s + d.totalOrderAmount, 0),
        totalCommission: doctors.reduce((s, d) => s + d.totalCommission, 0),
      },
    };
  }
}

interface ReferralRow {
  referral_count?: number;
  referralCount?: number;
  total_order_amount?: number;
  totalOrderAmount?: number;
  total_commission?: number;
  totalCommission?: number;
}
