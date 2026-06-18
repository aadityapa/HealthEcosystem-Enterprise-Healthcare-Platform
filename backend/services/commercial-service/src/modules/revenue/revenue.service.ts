import { Inject, Injectable } from '@nestjs/common';
import { SubscriptionStatus, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';

@Injectable()
export class RevenueService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async getDashboard(_ctx: ServiceRequestContext) {
    const activeSubscriptions = await this.prisma.tenantSubscription.findMany({
      where: { status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] } },
      include: { plan: true },
    });

    const mrr = activeSubscriptions.reduce((sum, sub) => sum + Number(sub.mrr), 0);
    const arr = mrr * 12;

    const byPlan = new Map<string, { planCode: string; planName: string; count: number; mrr: number }>();
    for (const sub of activeSubscriptions) {
      const key = sub.plan.code;
      const existing = byPlan.get(key) ?? {
        planCode: sub.plan.code,
        planName: sub.plan.name,
        count: 0,
        mrr: 0,
      };
      existing.count += 1;
      existing.mrr += Number(sub.mrr);
      byPlan.set(key, existing);
    }

    const byStatus = {
      trial: activeSubscriptions.filter((s) => s.status === SubscriptionStatus.TRIAL).length,
      active: activeSubscriptions.filter((s) => s.status === SubscriptionStatus.ACTIVE).length,
      suspended: await this.prisma.tenantSubscription.count({
        where: { status: SubscriptionStatus.SUSPENDED },
      }),
      cancelled: await this.prisma.tenantSubscription.count({
        where: { status: SubscriptionStatus.CANCELLED },
      }),
    };

    return {
      currency: 'INR',
      mrr: Number(mrr.toFixed(2)),
      arr: Number(arr.toFixed(2)),
      activeSubscriptions: activeSubscriptions.length,
      byPlan: [...byPlan.values()],
      byStatus,
    };
  }
}
