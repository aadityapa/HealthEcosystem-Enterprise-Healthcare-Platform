import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LotStatus, TransferStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { nextTransferNumber, resolveLotStatus, toNumber } from '@/common/utils/inventory.util';
import type { CreateStockTransferDto, ListStockTransfersDto } from './dto/stock-transfers.dto';

@Injectable()
export class StockTransfersService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateStockTransferDto) {
    if (dto.toBranchId === ctx.branchId) {
      throw new BadRequestException('Cannot transfer to the same branch');
    }

    const toBranch = await this.prisma.branch.findFirst({
      where: { id: dto.toBranchId, tenantId: ctx.tenantId },
    });
    if (!toBranch) throw new NotFoundException('Destination branch not found');

    return this.prisma.$transaction(async (tx) => {
      const transferNumber = await nextTransferNumber(() =>
        tx.stockTransfer.count({ where: { tenantId: ctx.tenantId } }),
      );

      return tx.stockTransfer.create({
        data: {
          tenantId: ctx.tenantId,
          organizationId: ctx.organizationId,
          transferNumber,
          fromBranchId: ctx.branchId,
          toBranchId: dto.toBranchId,
          status: TransferStatus.DRAFT,
          notes: dto.notes,
          createdBy: ctx.userId,
          lines: {
            create: dto.lines.map((line) => ({
              itemId: line.itemId,
              lotNumber: line.lotNumber,
              quantity: line.quantity,
            })),
          },
        },
        include: { lines: { include: { item: true } } },
      });
    });
  }

  async get(ctx: ServiceRequestContext, transferId: string) {
    return this.findTransfer(ctx, transferId);
  }

  async list(ctx: ServiceRequestContext, query: ListStockTransfersDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = {
      tenantId: ctx.tenantId,
      OR: [{ fromBranchId: ctx.branchId }, { toBranchId: ctx.branchId }],
      ...(query.status && { status: query.status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.stockTransfer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { lines: { include: { item: true } } },
      }),
      this.prisma.stockTransfer.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async ship(ctx: ServiceRequestContext, transferId: string) {
    const transfer = await this.findTransfer(ctx, transferId);

    if (transfer.fromBranchId !== ctx.branchId) {
      throw new BadRequestException('Only the source branch can ship a transfer');
    }

    if (transfer.status !== TransferStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot ship transfer in status ${transfer.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      for (const line of transfer.lines) {
        const lot = await tx.stockLot.findFirst({
          where: {
            tenantId: ctx.tenantId,
            branchId: ctx.branchId,
            itemId: line.itemId,
            lotNumber: line.lotNumber,
          },
          include: { item: true },
        });

        if (!lot) {
          throw new NotFoundException(
            `Lot ${line.lotNumber} not found for item ${line.itemId}`,
          );
        }

        const available = toNumber(lot.availableQty);
        const qty = toNumber(line.quantity);

        if (available < qty) {
          throw new BadRequestException(
            `Insufficient stock in lot ${line.lotNumber}: available ${available}, requested ${qty}`,
          );
        }

        const newAvailable = available - qty;
        const reorderLevel = toNumber(lot.item.reorderLevel);
        const status =
          newAvailable <= 0
            ? LotStatus.DEPLETED
            : resolveLotStatus(newAvailable, reorderLevel, lot.expiresAt);

        await tx.stockLot.update({
          where: { id: lot.id },
          data: { availableQty: newAvailable, status },
        });
      }

      return tx.stockTransfer.update({
        where: { id: transferId },
        data: {
          status: TransferStatus.IN_TRANSIT,
          shippedAt: new Date(),
        },
        include: { lines: { include: { item: true } } },
      });
    });
  }

  async receive(ctx: ServiceRequestContext, transferId: string) {
    const transfer = await this.findTransfer(ctx, transferId);

    if (transfer.toBranchId !== ctx.branchId) {
      throw new BadRequestException('Only the destination branch can receive a transfer');
    }

    if (transfer.status !== TransferStatus.IN_TRANSIT) {
      throw new BadRequestException(
        `Cannot receive transfer in status ${transfer.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      for (const line of transfer.lines) {
        const qty = toNumber(line.quantity);
        const existing = await tx.stockLot.findFirst({
          where: {
            tenantId: ctx.tenantId,
            branchId: ctx.branchId,
            itemId: line.itemId,
            lotNumber: line.lotNumber,
          },
        });

        if (existing) {
          const newAvailable = toNumber(existing.availableQty) + qty;
          const item = await tx.inventoryItem.findFirst({
            where: { id: line.itemId },
          });
          const reorderLevel = toNumber(item?.reorderLevel);
          const status = resolveLotStatus(
            newAvailable,
            reorderLevel,
            existing.expiresAt,
          );

          await tx.stockLot.update({
            where: { id: existing.id },
            data: {
              availableQty: newAvailable,
              quantity: toNumber(existing.quantity) + qty,
              status,
            },
          });
        } else {
          const sourceLot = await tx.stockLot.findFirst({
            where: {
              tenantId: ctx.tenantId,
              branchId: transfer.fromBranchId,
              itemId: line.itemId,
              lotNumber: line.lotNumber,
            },
            include: { item: true },
          });

          const item = sourceLot?.item ??
            (await tx.inventoryItem.findFirst({ where: { id: line.itemId } }));

          if (!item) throw new NotFoundException(`Item ${line.itemId} not found`);

          const reorderLevel = toNumber(item.reorderLevel);
          const expiresAt = sourceLot?.expiresAt ?? null;
          const status = resolveLotStatus(qty, reorderLevel, expiresAt);

          await tx.stockLot.create({
            data: {
              tenantId: ctx.tenantId,
              organizationId: ctx.organizationId,
              branchId: ctx.branchId,
              itemId: line.itemId,
              lotNumber: line.lotNumber,
              batchNumber: sourceLot?.batchNumber,
              quantity: qty,
              availableQty: qty,
              unitCost: sourceLot?.unitCost,
              manufacturedAt: sourceLot?.manufacturedAt,
              expiresAt,
              status,
            },
          });
        }
      }

      return tx.stockTransfer.update({
        where: { id: transferId },
        data: {
          status: TransferStatus.RECEIVED,
          receivedAt: new Date(),
        },
        include: { lines: { include: { item: true } } },
      });
    });
  }

  private async findTransfer(ctx: ServiceRequestContext, transferId: string) {
    const transfer = await this.prisma.stockTransfer.findFirst({
      where: {
        id: transferId,
        tenantId: ctx.tenantId,
        OR: [{ fromBranchId: ctx.branchId }, { toBranchId: ctx.branchId }],
      },
      include: { lines: { include: { item: true } } },
    });
    if (!transfer) throw new NotFoundException('Stock transfer not found');
    return transfer;
  }
}
