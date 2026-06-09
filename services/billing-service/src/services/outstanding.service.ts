import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import { toNumber, round2 } from '@/common/utils/decimal.util';

@Injectable()
export class OutstandingService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async onInvoiceIssued(
    tenantId: string,
    organizationId: string,
    entityType: string,
    entityId: string,
    amount: number,
    dueDate?: Date | null,
  ): Promise<void> {
    const existing = await this.prisma.outstandingBalance.findUnique({
      where: { tenantId_entityType_entityId: { tenantId, entityType, entityId } },
    });

    if (existing) {
      const newTotal = round2(toNumber(existing.totalOutstanding) + amount);
      const overdue = dueDate && dueDate < new Date()
        ? round2(toNumber(existing.overdueAmount) + amount)
        : toNumber(existing.overdueAmount);

      await this.prisma.outstandingBalance.update({
        where: { id: existing.id },
        data: {
          totalOutstanding: newTotal,
          overdueAmount: overdue,
          oldestDueDate: dueDate ?? existing.oldestDueDate,
        },
      });
      return;
    }

    await this.prisma.outstandingBalance.create({
      data: {
        tenantId,
        organizationId,
        entityType,
        entityId,
        totalOutstanding: amount,
        overdueAmount: dueDate && dueDate < new Date() ? amount : 0,
        oldestDueDate: dueDate,
      },
    });
  }

  async onPaymentReceived(
    tenantId: string,
    entityType: string,
    entityId: string,
    amount: number,
  ): Promise<void> {
    const existing = await this.prisma.outstandingBalance.findUnique({
      where: { tenantId_entityType_entityId: { tenantId, entityType, entityId } },
    });
    if (!existing) return;

    const newTotal = Math.max(0, round2(toNumber(existing.totalOutstanding) - amount));
    await this.prisma.outstandingBalance.update({
      where: { id: existing.id },
      data: {
        totalOutstanding: newTotal,
        overdueAmount: newTotal === 0 ? 0 : toNumber(existing.overdueAmount),
      },
    });
  }

  async getAgingReport(tenantId: string, organizationId: string) {
    const balances = await this.prisma.outstandingBalance.findMany({
      where: { tenantId, organizationId, totalOutstanding: { gt: 0 } },
      orderBy: { totalOutstanding: 'desc' },
    });

    const now = new Date();
    return balances.map((b) => {
      const total = toNumber(b.totalOutstanding);
      const overdue = toNumber(b.overdueAmount);
      const daysPastDue = b.oldestDueDate
        ? Math.max(0, Math.floor((now.getTime() - b.oldestDueDate.getTime()) / 86400000))
        : 0;

      return {
        entityType: b.entityType,
        entityId: b.entityId,
        totalOutstanding: total,
        overdueAmount: overdue,
        current: daysPastDue <= 0 ? total : 0,
        days1to30: daysPastDue > 0 && daysPastDue <= 30 ? overdue : 0,
        days31to60: daysPastDue > 30 && daysPastDue <= 60 ? overdue : 0,
        days61to90: daysPastDue > 60 && daysPastDue <= 90 ? overdue : 0,
        days90plus: daysPastDue > 90 ? overdue : 0,
        oldestDueDate: b.oldestDueDate,
      };
    });
  }
}
