import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { MasterRequestContext } from '@/common/context/master-context';
import { MasterEventsService } from '@/common/services/master-events.service';

@Injectable()
export class RateCardsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly events: MasterEventsService,
  ) {}

  async create(
    ctx: MasterRequestContext,
    dto: {
      code: string;
      name: string;
      cardType: string;
      clientType: string;
      branchId?: string;
      clientId?: string;
      pricingRules?: unknown[];
      effectiveFrom?: string;
      effectiveTo?: string;
    },
  ) {
    const existing = await this.prisma.rateCard.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Rate card code "${dto.code}" already exists`);
    }

    const rateCard = await this.prisma.rateCard.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: dto.branchId ?? ctx.branchId,
        code: dto.code,
        name: dto.name,
        cardType: dto.cardType,
        clientType: dto.clientType,
        clientId: dto.clientId,
        pricingRules: (dto.pricingRules ?? []) as Prisma.InputJsonValue,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
      },
    });

    await this.events.publishUpdated(ctx, 'RateCard', rateCard.id, 'created', {
      code: rateCard.code,
    });

    return rateCard;
  }

  async get(ctx: MasterRequestContext, rateCardId: string) {
    const rateCard = await this.prisma.rateCard.findFirst({
      where: { id: rateCardId, tenantId: ctx.tenantId },
    });
    if (!rateCard) throw new NotFoundException('Rate card not found');
    return rateCard;
  }

  async list(
    ctx: MasterRequestContext,
    filters: {
      clientType?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.RateCardWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.clientType && { clientType: filters.clientType }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.rateCard.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.rateCard.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async update(
    ctx: MasterRequestContext,
    rateCardId: string,
    dto: {
      name?: string;
      cardType?: string;
      clientType?: string;
      branchId?: string;
      clientId?: string;
      pricingRules?: unknown[];
      effectiveTo?: string;
      isActive?: boolean;
    },
  ) {
    await this.get(ctx, rateCardId);

    const rateCard = await this.prisma.rateCard.update({
      where: { id: rateCardId, tenantId: ctx.tenantId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.cardType !== undefined && { cardType: dto.cardType }),
        ...(dto.clientType !== undefined && { clientType: dto.clientType }),
        ...(dto.branchId !== undefined && { branchId: dto.branchId }),
        ...(dto.clientId !== undefined && { clientId: dto.clientId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.pricingRules !== undefined && {
          pricingRules: dto.pricingRules as Prisma.InputJsonValue,
        }),
        ...(dto.effectiveTo !== undefined && {
          effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
        }),
      },
    });

    await this.events.publishUpdated(ctx, 'RateCard', rateCard.id, 'updated');

    return rateCard;
  }
}
