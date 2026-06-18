import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import { formatDatePart } from '@/common/utils/decimal.util';

@Injectable()
export class BillingSequenceService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async nextNumber(
    tenantId: string,
    branchId: string,
    seqType: string,
    branchCode: string,
    date = new Date(),
  ): Promise<string> {
    const datePart = formatDatePart(date);
    const prefix = `${seqType}-${branchCode}-${datePart}`;

    const seq = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.billingSequence.findUnique({
        where: { tenantId_branchId_seqType: { tenantId, branchId, seqType } },
      });

      if (!existing || existing.prefix !== prefix) {
        const record = await tx.billingSequence.upsert({
          where: { tenantId_branchId_seqType: { tenantId, branchId, seqType } },
          create: { tenantId, branchId, seqType, prefix, lastSeq: 1 },
          update: { prefix, lastSeq: 1 },
        });
        return record.lastSeq;
      }

      const updated = await tx.billingSequence.update({
        where: { tenantId_branchId_seqType: { tenantId, branchId, seqType } },
        data: { lastSeq: { increment: 1 } },
      });
      return updated.lastSeq;
    });

    return `${prefix}-${String(seq).padStart(5, '0')}`;
  }
}
