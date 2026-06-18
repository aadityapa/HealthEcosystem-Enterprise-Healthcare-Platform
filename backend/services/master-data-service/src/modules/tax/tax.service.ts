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
import { CacheService } from '@/common/services/cache.service';
import { MasterEventsService } from '@/common/services/master-events.service';

@Injectable()
export class TaxService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly cache: CacheService,
    private readonly events: MasterEventsService,
  ) {}

  private taxCacheKey(tenantId: string): string {
    return `master:tax:${tenantId}`;
  }

  private async invalidateTaxCache(tenantId: string): Promise<void> {
    await this.cache.del(this.taxCacheKey(tenantId));
  }

  async create(
    ctx: MasterRequestContext,
    dto: {
      code: string;
      name: string;
      hsnSacCode?: string;
      cgstRate?: number;
      sgstRate?: number;
      igstRate?: number;
      cessRate?: number;
      isExempt?: boolean;
      effectiveFrom?: string;
      effectiveTo?: string;
    },
  ) {
    const existing = await this.prisma.taxMaster.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Tax code "${dto.code}" already exists`);
    }

    const tax = await this.prisma.taxMaster.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        hsnSacCode: dto.hsnSacCode,
        cgstRate: dto.cgstRate ?? 0,
        sgstRate: dto.sgstRate ?? 0,
        igstRate: dto.igstRate ?? 0,
        cessRate: dto.cessRate ?? 0,
        isExempt: dto.isExempt ?? false,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
      },
    });

    await this.invalidateTaxCache(ctx.tenantId);
    await this.events.publishUpdated(ctx, 'TaxMaster', tax.id, 'created', { code: tax.code });

    return tax;
  }

  async get(ctx: MasterRequestContext, taxId: string) {
    const tax = await this.prisma.taxMaster.findFirst({
      where: { id: taxId, tenantId: ctx.tenantId },
    });
    if (!tax) throw new NotFoundException('Tax record not found');
    return tax;
  }

  async list(
    ctx: MasterRequestContext,
    filters: { isActive?: boolean; page?: number; limit?: number },
  ) {
    const cacheKey = `${this.taxCacheKey(ctx.tenantId)}:${JSON.stringify(filters)}`;
    const cached = await this.cache.get<{ items: unknown[]; meta: unknown }>(cacheKey);
    if (cached) return cached;

    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.TaxMasterWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.taxMaster.findMany({
        where,
        skip,
        take,
        orderBy: { code: 'asc' },
      }),
      this.prisma.taxMaster.count({ where }),
    ]);

    const result = { items, meta: paginationMeta(total, page, limit) };
    await this.cache.set(cacheKey, result);
    return result;
  }

  async update(
    ctx: MasterRequestContext,
    taxId: string,
    dto: {
      name?: string;
      hsnSacCode?: string;
      cgstRate?: number;
      sgstRate?: number;
      igstRate?: number;
      cessRate?: number;
      isExempt?: boolean;
      effectiveTo?: string;
      isActive?: boolean;
    },
  ) {
    await this.get(ctx, taxId);

    const tax = await this.prisma.taxMaster.update({
      where: { id: taxId, tenantId: ctx.tenantId },
      data: {
        ...dto,
        ...(dto.effectiveTo !== undefined && {
          effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
        }),
      },
    });

    await this.invalidateTaxCache(ctx.tenantId);
    await this.events.publishUpdated(ctx, 'TaxMaster', tax.id, 'updated');

    return tax;
  }
}
