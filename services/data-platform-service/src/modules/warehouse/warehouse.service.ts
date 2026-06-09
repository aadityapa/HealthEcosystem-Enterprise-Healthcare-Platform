import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import {
  ListWarehouseTablesQueryDto,
  RefreshWarehouseDto,
} from './dto/warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async listTables(ctx: ServiceRequestContext, query: ListWarehouseTablesQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = {
      tenantId: ctx.tenantId,
      ...(query.schemaName && { schemaName: query.schemaName }),
    };

    const [items, total] = await Promise.all([
      this.prisma.warehouseTable.findMany({
        where,
        skip,
        take,
        orderBy: { lastRefreshedAt: 'desc' },
      }),
      this.prisma.warehouseTable.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async refresh(ctx: ServiceRequestContext, dto: RefreshWarehouseDto) {
    const where = {
      tenantId: ctx.tenantId,
      ...(dto.tableName && { tableName: dto.tableName }),
    };

    const tables = await this.prisma.warehouseTable.findMany({ where });
    if (!tables.length) {
      throw new NotFoundException('No warehouse tables found to refresh');
    }

    const refreshed = await Promise.all(
      tables.map((table) =>
        this.prisma.warehouseTable.update({
          where: { id: table.id },
          data: {
            lastRefreshedAt: new Date(),
            rowCount: (table.rowCount ?? BigInt(0)) + BigInt(100),
            sparkJobId: `refresh-${table.id.slice(0, 8)}`,
          },
        }),
      ),
    );

    return {
      refreshed: refreshed.length,
      tables: refreshed,
      status: 'stub',
    };
  }
}
