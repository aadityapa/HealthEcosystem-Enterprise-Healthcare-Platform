import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreateInventoryItemDto,
  ListInventoryItemsDto,
  UpdateInventoryItemDto,
} from './dto/items.dto';

@Injectable()
export class ItemsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateInventoryItemDto) {
    const existing = await this.prisma.inventoryItem.findFirst({
      where: { tenantId: ctx.tenantId, sku: dto.sku },
    });
    if (existing) {
      throw new ConflictException(`SKU "${dto.sku}" already exists`);
    }

    if (dto.vendorId) {
      await this.assertVendorExists(ctx, dto.vendorId);
    }

    return this.prisma.inventoryItem.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        itemType: dto.itemType,
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        unit: dto.unit ?? 'unit',
        reorderLevel: dto.reorderLevel ?? 0,
        vendorId: dto.vendorId,
        storageTemp: dto.storageTemp,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
      },
      include: { vendor: true },
    });
  }

  async get(ctx: ServiceRequestContext, itemId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: itemId, tenantId: ctx.tenantId },
      include: { vendor: true },
    });
    if (!item) throw new NotFoundException('Inventory item not found');
    return item;
  }

  async list(ctx: ServiceRequestContext, query: ListInventoryItemsDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where: Prisma.InventoryItemWhereInput = {
      tenantId: ctx.tenantId,
      organizationId: ctx.organizationId,
      ...(query.itemType && { itemType: query.itemType }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: { vendor: true },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async update(
    ctx: ServiceRequestContext,
    itemId: string,
    dto: UpdateInventoryItemDto,
  ) {
    await this.get(ctx, itemId);

    if (dto.vendorId) {
      await this.assertVendorExists(ctx, dto.vendorId);
    }

    return this.prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        ...dto,
        metadata: dto.metadata
          ? (dto.metadata as Prisma.InputJsonValue)
          : undefined,
      },
      include: { vendor: true },
    });
  }

  private async assertVendorExists(ctx: ServiceRequestContext, vendorId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, tenantId: ctx.tenantId },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
  }
}
