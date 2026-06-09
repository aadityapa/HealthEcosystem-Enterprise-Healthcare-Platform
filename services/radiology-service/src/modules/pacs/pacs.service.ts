import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreatePacsNodeDto, UpdatePacsNodeDto } from './dto/pacs.dto';

@Injectable()
export class PacsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreatePacsNodeDto) {
    const existing = await this.prisma.pacsNode.findFirst({
      where: { tenantId: ctx.tenantId, aeTitle: dto.aeTitle },
    });
    if (existing) throw new ConflictException('AE title already registered');

    return this.prisma.pacsNode.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        name: dto.name,
        aeTitle: dto.aeTitle,
        host: dto.host,
        port: dto.port ?? 104,
      },
    });
  }

  async list(ctx: ServiceRequestContext, page = 1, limit = 20) {
    const { skip, take } = paginate(page, limit);
    const where = { tenantId: ctx.tenantId, branchId: ctx.branchId };

    const [items, total] = await Promise.all([
      this.prisma.pacsNode.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pacsNode.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const node = await this.prisma.pacsNode.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!node) throw new NotFoundException('PACS node not found');
    return node;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdatePacsNodeDto) {
    await this.getById(ctx, id);
    return this.prisma.pacsNode.update({ where: { id }, data: dto });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.pacsNode.delete({ where: { id } });
    return { deleted: true };
  }
}
