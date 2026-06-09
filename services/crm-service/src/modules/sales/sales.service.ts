import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeadStatus, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { toNumber } from '@/common/utils/decimal.util';
import type {
  CreateSalesTargetDto,
  DashboardQueryDto,
  UpdateSalesTargetDto,
} from './dto/sales.dto';

@Injectable()
export class SalesService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async createTarget(ctx: ServiceRequestContext, dto: CreateSalesTargetDto) {
    const existing = await this.prisma.salesTarget.findUnique({
      where: {
        tenantId_userId_periodMonth_periodYear: {
          tenantId: ctx.tenantId,
          userId: dto.userId,
          periodMonth: dto.periodMonth,
          periodYear: dto.periodYear,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Sales target already exists for this period');
    }

    return this.prisma.salesTarget.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        userId: dto.userId,
        periodMonth: dto.periodMonth,
        periodYear: dto.periodYear,
        targetAmount: dto.targetAmount,
      },
    });
  }

  async listTargets(ctx: ServiceRequestContext, periodMonth?: number, periodYear?: number) {
    return this.prisma.salesTarget.findMany({
      where: {
        tenantId: ctx.tenantId,
        ...(periodMonth !== undefined && { periodMonth }),
        ...(periodYear !== undefined && { periodYear }),
      },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    });
  }

  async updateTarget(
    ctx: ServiceRequestContext,
    targetId: string,
    dto: UpdateSalesTargetDto,
  ) {
    const target = await this.prisma.salesTarget.findFirst({
      where: { id: targetId, tenantId: ctx.tenantId },
    });
    if (!target) throw new NotFoundException('Sales target not found');

    return this.prisma.salesTarget.update({
      where: { id: targetId },
      data: dto,
    });
  }

  async getDashboard(ctx: ServiceRequestContext, query: DashboardQueryDto) {
    const now = new Date();
    const periodMonth = query.periodMonth ?? now.getMonth() + 1;
    const periodYear = query.periodYear ?? now.getFullYear();

    const [
      leadStatusCounts,
      targets,
      referralCount,
      referralCommissionTotal,
      campStats,
      recentActivities,
    ] = await Promise.all([
      this.prisma.salesLead.groupBy({
        by: ['status'],
        where: { tenantId: ctx.tenantId },
        _count: { _all: true },
      }),
      this.prisma.salesTarget.findMany({
        where: {
          tenantId: ctx.tenantId,
          periodMonth,
          periodYear,
        },
      }),
      this.prisma.doctorReferral.count({
        where: { tenantId: ctx.tenantId },
      }),
      this.prisma.doctorReferral.aggregate({
        where: { tenantId: ctx.tenantId },
        _sum: { commissionAmount: true },
      }),
      this.prisma.camp.aggregate({
        where: { tenantId: ctx.tenantId },
        _count: { _all: true },
        _sum: { actualCount: true, targetCount: true },
      }),
      this.prisma.salesActivity.findMany({
        where: { lead: { tenantId: ctx.tenantId } },
        orderBy: { performedAt: 'desc' },
        take: 10,
        include: { lead: { select: { leadNumber: true, contactName: true } } },
      }),
    ]);

    const leadsByStatus = Object.fromEntries(
      Object.values(LeadStatus).map((status) => [status, 0]),
    ) as Record<LeadStatus, number>;

    for (const row of leadStatusCounts) {
      leadsByStatus[row.status] = row._count._all;
    }

    const totalTarget = targets.reduce(
      (sum, t) => sum + toNumber(t.targetAmount),
      0,
    );
    const totalAchieved = targets.reduce(
      (sum, t) => sum + toNumber(t.achievedAmount),
      0,
    );

    return {
      period: { month: periodMonth, year: periodYear },
      leads: {
        byStatus: leadsByStatus,
        total: Object.values(leadsByStatus).reduce((s, n) => s + n, 0),
      },
      salesTargets: {
        count: targets.length,
        totalTarget,
        totalAchieved,
        attainmentPct:
          totalTarget > 0
            ? Math.round((totalAchieved / totalTarget) * 10000) / 100
            : 0,
      },
      referrals: {
        count: referralCount,
        totalCommission: toNumber(referralCommissionTotal._sum.commissionAmount),
      },
      camps: {
        count: campStats._count._all,
        totalRegistrations: campStats._sum.actualCount ?? 0,
        totalTarget: campStats._sum.targetCount ?? 0,
      },
      recentActivities,
    };
  }
}
