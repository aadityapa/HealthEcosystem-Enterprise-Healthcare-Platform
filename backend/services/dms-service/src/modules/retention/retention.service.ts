import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentStatus, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';

@Injectable()
export class RetentionService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async getExpiring(ctx: ServiceRequestContext, withinDays = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);

    return this.prisma.document.findMany({
      where: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        legalHold: false,
        status: { in: [DocumentStatus.ACTIVE, DocumentStatus.ARCHIVED] },
        retentionUntil: { lte: cutoff, not: null },
      },
      orderBy: { retentionUntil: 'asc' },
    });
  }

  async setLegalHold(ctx: ServiceRequestContext, documentId: string, legalHold: boolean) {
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        status: { not: DocumentStatus.DELETED },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id: documentId },
      data: {
        legalHold,
        status: legalHold ? DocumentStatus.LEGAL_HOLD : DocumentStatus.ACTIVE,
      },
    });
  }
}
