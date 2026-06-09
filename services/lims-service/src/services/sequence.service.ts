import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';

function formatDatePart(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

@Injectable()
export class SequenceService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async nextSequence(
    tenantId: string,
    branchId: string,
    prefix: string,
  ): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.orderSequence.findUnique({
        where: { tenantId_branchId: { tenantId, branchId } },
      });

      if (!existing || existing.prefix !== prefix) {
        const record = await tx.orderSequence.upsert({
          where: { tenantId_branchId: { tenantId, branchId } },
          create: { tenantId, branchId, prefix, lastSeq: 1 },
          update: { prefix, lastSeq: 1 },
        });
        return record.lastSeq;
      }

      const updated = await tx.orderSequence.update({
        where: { tenantId_branchId: { tenantId, branchId } },
        data: { lastSeq: { increment: 1 } },
      });
      return updated.lastSeq;
    });
  }
}

@Injectable()
export class BarcodeService {
  constructor(private readonly sequenceService: SequenceService) {}

  async generate(
    tenantId: string,
    branchId: string,
    branchCode: string,
    date = new Date(),
  ): Promise<string> {
    const datePart = formatDatePart(date);
    const prefix = `BC-${branchCode}-${datePart}`;
    const seq = await this.sequenceService.nextSequence(tenantId, branchId, prefix);
    return `${prefix}-${String(seq).padStart(5, '0')}`;
  }
}

@Injectable()
export class OrderNumberService {
  constructor(private readonly sequenceService: SequenceService) {}

  async generate(
    tenantId: string,
    branchId: string,
    branchCode: string,
    date = new Date(),
  ): Promise<string> {
    const datePart = formatDatePart(date);
    const prefix = `ORD-${branchCode}-${datePart}`;
    const seq = await this.sequenceService.nextSequence(tenantId, branchId, prefix);
    return `${prefix}-${String(seq).padStart(5, '0')}`;
  }
}
