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
export class BillingCodesService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly events: MasterEventsService,
  ) {}

  async create(
    ctx: MasterRequestContext,
    dto: {
      code: string;
      name: string;
      description?: string;
      codeType: string;
      taxMasterId?: string;
      defaultPrice?: number;
    },
  ) {
    const existing = await this.prisma.billingCode.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Billing code "${dto.code}" already exists`);
    }

    const billingCode = await this.prisma.billingCode.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        codeType: dto.codeType,
        taxMasterId: dto.taxMasterId,
        defaultPrice: dto.defaultPrice,
      },
      include: { taxMaster: true },
    });

    await this.events.publishUpdated(ctx, 'BillingCode', billingCode.id, 'created', {
      code: billingCode.code,
    });

    return billingCode;
  }

  async get(ctx: MasterRequestContext, billingCodeId: string) {
    const billingCode = await this.prisma.billingCode.findFirst({
      where: { id: billingCodeId, tenantId: ctx.tenantId },
      include: { taxMaster: true },
    });
    if (!billingCode) throw new NotFoundException('Billing code not found');
    return billingCode;
  }

  async list(
    ctx: MasterRequestContext,
    filters: { codeType?: string; isActive?: boolean; page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.BillingCodeWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.codeType && { codeType: filters.codeType }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.billingCode.findMany({
        where,
        skip,
        take,
        orderBy: { code: 'asc' },
        include: { taxMaster: true },
      }),
      this.prisma.billingCode.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async update(
    ctx: MasterRequestContext,
    billingCodeId: string,
    dto: {
      name?: string;
      description?: string;
      codeType?: string;
      taxMasterId?: string;
      defaultPrice?: number;
      isActive?: boolean;
    },
  ) {
    await this.get(ctx, billingCodeId);

    const billingCode = await this.prisma.billingCode.update({
      where: { id: billingCodeId, tenantId: ctx.tenantId },
      data: dto,
      include: { taxMaster: true },
    });

    await this.events.publishUpdated(ctx, 'BillingCode', billingCode.id, 'updated');

    return billingCode;
  }
}
