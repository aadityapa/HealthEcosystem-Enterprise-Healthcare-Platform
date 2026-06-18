import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import { toNumber, round2 } from '@/common/utils/decimal.util';
import type { BillingRequestContext } from '@/common/context/billing-context';

export interface SurchargeResult {
  surchargeType: string;
  description: string;
  amount: number;
}

@Injectable()
export class SurchargeService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async calculateSurcharges(
    ctx: BillingRequestContext,
    invoiceType: string,
    subtotal: number,
  ): Promise<SurchargeResult[]> {
    const types: string[] = [];
    if (invoiceType === 'HOME_COLLECTION') types.push('HOME_COLLECTION');
    if (invoiceType === 'URGENT') types.push('URGENT');

    if (!types.length) return [];

    const rules = await this.prisma.surchargeRule.findMany({
      where: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        surchargeType: { in: types },
        isActive: true,
      },
    });

    return rules.map((rule) => {
      let amount = 0;
      if (rule.amount != null) {
        amount = toNumber(rule.amount);
      } else if (rule.percent != null) {
        amount = round2((subtotal * toNumber(rule.percent)) / 100);
      }

      return {
        surchargeType: rule.surchargeType,
        description: rule.name,
        amount,
      };
    });
  }
}
