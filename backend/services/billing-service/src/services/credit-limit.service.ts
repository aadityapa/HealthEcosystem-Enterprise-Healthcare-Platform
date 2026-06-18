import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import { toNumber } from '@/common/utils/decimal.util';
import type { BillingRequestContext } from '@/common/context/billing-context';

@Injectable()
export class CreditLimitService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async assertAvailableCredit(
    ctx: BillingRequestContext,
    corporateClientId: string,
    invoiceAmount: number,
  ): Promise<void> {
    const creditLimit = await this.prisma.creditLimit.findUnique({
      where: { corporateClientId },
    });

    if (!creditLimit) return;

    const available = toNumber(creditLimit.availableAmount);
    if (invoiceAmount > available) {
      throw new BadRequestException(
        `Credit limit exceeded. Available: ${available}, requested: ${invoiceAmount}`,
      );
    }
  }

  async reserveCredit(corporateClientId: string, amount: number): Promise<void> {
    await this.prisma.creditLimit.update({
      where: { corporateClientId },
      data: {
        usedAmount: { increment: amount },
        availableAmount: { decrement: amount },
      },
    });
  }

  async releaseCredit(corporateClientId: string, amount: number): Promise<void> {
    await this.prisma.creditLimit.update({
      where: { corporateClientId },
      data: {
        usedAmount: { decrement: amount },
        availableAmount: { increment: amount },
      },
    });
  }
}
