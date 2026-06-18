import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LotStatus, Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { resolveLotStatus, toNumber } from '@/common/utils/inventory.util';
import type {
  CreateStockLotDto,
  ExpiringLotsDto,
  ListStockLotsDto,
  UpdateStockLotDto,
} from './dto/stock-lots.dto';

@Injectable()
export class StockLotsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateStockLotDto) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: dto.itemId, tenantId: ctx.tenantId },
    });
    if (!item) throw new NotFoundException('Inventory item not found');

    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    const reorderLevel = toNumber(item.reorderLevel);
    const status = resolveLotStatus(dto.quantity, reorderLevel, expiresAt);

    return this.prisma.stockLot.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        itemId: dto.itemId,
        lotNumber: dto.lotNumber,
        batchNumber: dto.batchNumber,
        quantity: dto.quantity,
        availableQty: dto.quantity,
        unitCost: dto.unitCost,
        manufacturedAt: dto.manufacturedAt ? new Date(dto.manufacturedAt) : null,
        expiresAt,
        status,
        location: dto.location,
      },
      include: { item: true },
    });
  }

  async get(ctx: ServiceRequestContext, lotId: string) {
    const lot = await this.findLot(ctx, lotId);
    return this.applyStatusRules(lot);
  }

  async list(ctx: ServiceRequestContext, query: ListStockLotsDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where: Prisma.StockLotWhereInput = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      ...(query.itemId && { itemId: query.itemId }),
      ...(query.status && { status: query.status }),
    };

    const [rawItems, total] = await Promise.all([
      this.prisma.stockLot.findMany({
        where,
        skip,
        take,
        orderBy: { receivedAt: 'desc' },
        include: { item: true },
      }),
      this.prisma.stockLot.count({ where }),
    ]);

    const items = await Promise.all(rawItems.map((lot) => this.applyStatusRules(lot)));

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async findExpiring(ctx: ServiceRequestContext, query: ExpiringLotsDto) {
    const days = query.days ?? 30;
    const now = new Date();
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() + days);

    const lots = await this.prisma.stockLot.findMany({
      where: {
        tenantId: ctx.tenantId,
        branchId: ctx.branchId,
        expiresAt: { lte: threshold, not: null },
        status: { notIn: [LotStatus.DEPLETED, LotStatus.QUARANTINE] },
      },
      orderBy: { expiresAt: 'asc' },
      include: { item: true },
    });

    return Promise.all(lots.map((lot) => this.applyStatusRules(lot)));
  }

  async update(ctx: ServiceRequestContext, lotId: string, dto: UpdateStockLotDto) {
    const lot = await this.findLot(ctx, lotId);

    const availableQty = dto.availableQty ?? toNumber(lot.availableQty);
    const reorderLevel = toNumber(lot.item.reorderLevel);
    const status =
      dto.status ??
      resolveLotStatus(availableQty, reorderLevel, lot.expiresAt);

    return this.prisma.stockLot.update({
      where: { id: lotId },
      data: {
        availableQty: dto.availableQty,
        location: dto.location,
        status,
      },
      include: { item: true },
    });
  }

  async applyStatusRules(
    lot: Prisma.StockLotGetPayload<{ include: { item: true } }>,
  ) {
    const availableQty = toNumber(lot.availableQty);
    const reorderLevel = toNumber(lot.item.reorderLevel);
    const computed = resolveLotStatus(availableQty, reorderLevel, lot.expiresAt);

    if (
      computed !== lot.status &&
      lot.status !== LotStatus.QUARANTINE &&
      lot.status !== LotStatus.DEPLETED
    ) {
      return this.prisma.stockLot.update({
        where: { id: lot.id },
        data: { status: computed },
        include: { item: true },
      });
    }

    return lot;
  }

  private async findLot(ctx: ServiceRequestContext, lotId: string) {
    const lot = await this.prisma.stockLot.findFirst({
      where: { id: lotId, tenantId: ctx.tenantId, branchId: ctx.branchId },
      include: { item: true },
    });
    if (!lot) throw new NotFoundException('Stock lot not found');
    return lot;
  }
}
