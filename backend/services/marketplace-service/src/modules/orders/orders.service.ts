import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PartnerOrderStatus, Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  B2BOrderDto,
  BookTestOrderDto,
  ListOrdersQueryDto,
} from './dto/orders.dto';

@Injectable()
export class OrdersService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async bookTest(ctx: ServiceRequestContext, dto: BookTestOrderDto) {
    const partner = await this.prisma.partnerLab.findFirst({
      where: { id: dto.partnerLabId, tenantId: ctx.tenantId, isActive: true },
    });
    if (!partner) throw new NotFoundException('Partner lab not found');

    const orderNumber = dto.orderNumber ?? (await this.nextOrderNumber(ctx.tenantId));

    return this.prisma.partnerOrder.create({
      data: {
        tenantId: ctx.tenantId,
        partnerLabId: dto.partnerLabId,
        patientId: dto.patientId,
        orderNumber,
        orderType: 'B2C',
        status: PartnerOrderStatus.PENDING,
        totalAmount: dto.totalAmount,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async createB2BOrder(ctx: ServiceRequestContext, dto: B2BOrderDto) {
    const partner = await this.prisma.partnerLab.findFirst({
      where: { id: dto.partnerLabId, tenantId: ctx.tenantId, isActive: true },
    });
    if (!partner) throw new NotFoundException('Partner lab not found');

    const orderNumber = dto.orderNumber ?? (await this.nextOrderNumber(ctx.tenantId));

    return this.prisma.partnerOrder.create({
      data: {
        tenantId: ctx.tenantId,
        partnerLabId: dto.partnerLabId,
        corporateId: dto.corporateId,
        orderNumber,
        orderType: 'B2B',
        status: PartnerOrderStatus.CONFIRMED,
        totalAmount: dto.totalAmount,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListOrdersQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where: Prisma.PartnerOrderWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.partnerLabId && { partnerLabId: filters.partnerLabId }),
      ...(filters.status && { status: filters.status as PartnerOrderStatus }),
    };

    const [items, total] = await Promise.all([
      this.prisma.partnerOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { partnerLab: { select: { code: true, name: true } } },
      }),
      this.prisma.partnerOrder.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const order = await this.prisma.partnerOrder.findFirst({
      where: { id, tenantId: ctx.tenantId },
      include: { partnerLab: true },
    });
    if (!order) throw new NotFoundException('Partner order not found');
    return order;
  }

  private async nextOrderNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.partnerOrder.count({ where: { tenantId } });
    return `ORD-${String(count + 1).padStart(6, '0')}`;
  }
}
