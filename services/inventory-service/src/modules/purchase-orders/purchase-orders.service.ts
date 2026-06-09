import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PoStatus, Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { nextPoNumber, resolveLotStatus, toNumber } from '@/common/utils/inventory.util';
import type {
  CreatePurchaseOrderDto,
  ListPurchaseOrdersDto,
  ReceivePurchaseOrderLineDto,
} from './dto/purchase-orders.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreatePurchaseOrderDto) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: dto.vendorId, tenantId: ctx.tenantId },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    return this.prisma.$transaction(async (tx) => {
      const poNumber = await nextPoNumber(() =>
        tx.purchaseOrder.count({ where: { tenantId: ctx.tenantId } }),
      );

      let totalAmount = 0;
      const lineData = dto.lines.map((line) => {
        const lineTotal = line.quantity * line.unitPrice;
        totalAmount += lineTotal;
        return {
          itemId: line.itemId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineTotal,
        };
      });

      return tx.purchaseOrder.create({
        data: {
          tenantId: ctx.tenantId,
          organizationId: ctx.organizationId,
          branchId: ctx.branchId,
          vendorId: dto.vendorId,
          poNumber,
          status: PoStatus.DRAFT,
          totalAmount,
          expectedAt: dto.expectedAt ? new Date(dto.expectedAt) : null,
          notes: dto.notes,
          createdBy: ctx.userId,
          lines: { create: lineData },
        },
        include: { lines: { include: { item: true } }, vendor: true },
      });
    });
  }

  async get(ctx: ServiceRequestContext, purchaseOrderId: string) {
    const po = await this.findPo(ctx, purchaseOrderId);
    return po;
  }

  async list(ctx: ServiceRequestContext, query: ListPurchaseOrdersDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where: Prisma.PurchaseOrderWhereInput = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      ...(query.status && { status: query.status }),
      ...(query.vendorId && { vendorId: query.vendorId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { vendor: true, lines: { include: { item: true } } },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async approve(ctx: ServiceRequestContext, purchaseOrderId: string) {
    const po = await this.findPo(ctx, purchaseOrderId);

    if (po.status !== PoStatus.DRAFT && po.status !== PoStatus.SUBMITTED) {
      throw new BadRequestException(
        `Cannot approve purchase order in status ${po.status}`,
      );
    }

    return this.prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: {
        status: PoStatus.APPROVED,
        approvedAt: new Date(),
      },
      include: { lines: { include: { item: true } }, vendor: true },
    });
  }

  async receiveLine(
    ctx: ServiceRequestContext,
    purchaseOrderId: string,
    lineId: string,
    dto: ReceivePurchaseOrderLineDto,
  ) {
    const po = await this.findPo(ctx, purchaseOrderId);

    if (po.status !== PoStatus.APPROVED && po.status !== PoStatus.PARTIALLY_RECEIVED) {
      throw new BadRequestException(
        `Cannot receive items for purchase order in status ${po.status}`,
      );
    }

    const line = po.lines.find((l) => l.id === lineId);
    if (!line) throw new NotFoundException('Purchase order line not found');

    const orderedQty = toNumber(line.quantity);
    const alreadyReceived = toNumber(line.receivedQty);
    const remaining = orderedQty - alreadyReceived;

    if (dto.quantity > remaining) {
      throw new BadRequestException(
        `Cannot receive ${dto.quantity}; only ${remaining} remaining on line`,
      );
    }

    const newReceivedQty = alreadyReceived + dto.quantity;
    const reorderLevel = toNumber(line.item.reorderLevel);
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    const lotStatus = resolveLotStatus(dto.quantity, reorderLevel, expiresAt);

    return this.prisma.$transaction(async (tx) => {
      await tx.purchaseOrderLine.update({
        where: { id: lineId },
        data: { receivedQty: newReceivedQty },
      });

      await tx.stockLot.create({
        data: {
          tenantId: ctx.tenantId,
          organizationId: ctx.organizationId,
          branchId: ctx.branchId,
          itemId: line.itemId,
          lotNumber: dto.lotNumber,
          batchNumber: dto.batchNumber,
          quantity: dto.quantity,
          availableQty: dto.quantity,
          unitCost: dto.unitCost ?? toNumber(line.unitPrice),
          expiresAt,
          status: lotStatus,
          location: dto.location,
        },
      });

      const updatedLines = await tx.purchaseOrderLine.findMany({
        where: { purchaseOrderId },
      });

      const allReceived = updatedLines.every(
        (l) => toNumber(l.receivedQty) >= toNumber(l.quantity),
      );
      const anyReceived = updatedLines.some((l) => toNumber(l.receivedQty) > 0);

      const status = allReceived
        ? PoStatus.RECEIVED
        : anyReceived
          ? PoStatus.PARTIALLY_RECEIVED
          : po.status;

      return tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: { status },
        include: { lines: { include: { item: true } }, vendor: true },
      });
    });
  }

  private async findPo(ctx: ServiceRequestContext, purchaseOrderId: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id: purchaseOrderId, tenantId: ctx.tenantId, branchId: ctx.branchId },
      include: { lines: { include: { item: true } }, vendor: true },
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }
}
