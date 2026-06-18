import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateQuotationDto, UpdateQuotationDto } from './dto/quotations.dto';

@Injectable()
export class QuotationsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  private async nextQuoteNumber(): Promise<string> {
    const count = await this.prisma.quotation.count();
    return `QT${String(count + 1).padStart(6, '0')}`;
  }

  async create(ctx: ServiceRequestContext, dto: CreateQuotationDto) {
    const quoteNumber = await this.nextQuoteNumber();

    return this.prisma.quotation.create({
      data: {
        tenantId: ctx.tenantId,
        quoteNumber,
        prospectName: dto.prospectName,
        prospectEmail: dto.prospectEmail,
        planCode: dto.planCode,
        totalAmount: dto.totalAmount,
        validUntil: new Date(dto.validUntil),
        lineItems: (dto.lineItems ?? []) as Prisma.InputJsonValue,
        createdBy: ctx.userId,
        status: 'draft',
      },
    });
  }

  async list(ctx: ServiceRequestContext, page = 1, limit = 20, status?: string) {
    const { skip, take } = paginate(page, limit);
    const where = {
      OR: [{ tenantId: ctx.tenantId }, { tenantId: null }],
      ...(status && { status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: {
        id,
        OR: [{ tenantId: ctx.tenantId }, { tenantId: null }],
      },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');
    return quotation;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateQuotationDto) {
    await this.getById(ctx, id);
    const { lineItems, validUntil, ...rest } = dto;
    return this.prisma.quotation.update({
      where: { id },
      data: {
        ...rest,
        ...(lineItems !== undefined && { lineItems: lineItems as Prisma.InputJsonValue }),
        validUntil: validUntil ? new Date(validUntil) : undefined,
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.quotation.delete({ where: { id } });
    return { deleted: true };
  }
}
