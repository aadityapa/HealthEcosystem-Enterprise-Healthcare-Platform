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
  CreateListingDto,
  ListListingsQueryDto,
  UpdateListingDto,
} from './dto/listings.dto';

@Injectable()
export class ListingsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateListingDto) {
    const existing = await this.prisma.marketplaceListing.findFirst({
      where: { tenantId: ctx.tenantId, itemCode: dto.itemCode },
    });
    if (existing) throw new ConflictException('Item code already exists');

    return this.prisma.marketplaceListing.create({
      data: {
        tenantId: ctx.tenantId,
        partnerLabId: dto.partnerLabId,
        listingType: dto.listingType,
        itemCode: dto.itemCode,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        mrp: dto.mrp,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListListingsQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where: Prisma.MarketplaceListingWhereInput = {
      tenantId: ctx.tenantId,
      isActive: true,
      ...(filters.listingType && { listingType: filters.listingType }),
      ...(filters.partnerLabId && { partnerLabId: filters.partnerLabId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.marketplaceListing.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.marketplaceListing.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const listing = await this.prisma.marketplaceListing.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateListingDto) {
    await this.getById(ctx, id);
    return this.prisma.marketplaceListing.update({
      where: { id },
      data: {
        ...dto,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.marketplaceListing.delete({ where: { id } });
    return { deleted: true };
  }
}
