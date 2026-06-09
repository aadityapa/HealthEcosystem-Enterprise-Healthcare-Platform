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
import type { CreatePartnerDto, UpdatePartnerDto } from './dto/partners.dto';

@Injectable()
export class PartnersService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreatePartnerDto) {
    const existing = await this.prisma.partnerLab.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) throw new ConflictException('Partner code already exists');

    return this.prisma.partnerLab.create({
      data: {
        tenantId: ctx.tenantId,
        code: dto.code,
        name: dto.name,
        city: dto.city,
        nablAccredited: dto.nablAccredited ?? false,
        rating: dto.rating,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
      },
    });
  }

  async list(ctx: ServiceRequestContext, page = 1, limit = 20) {
    const { skip, take } = paginate(page, limit);
    const where = { tenantId: ctx.tenantId };

    const [items, total] = await Promise.all([
      this.prisma.partnerLab.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.partnerLab.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const partner = await this.prisma.partnerLab.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!partner) throw new NotFoundException('Partner lab not found');
    return partner;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdatePartnerDto) {
    await this.getById(ctx, id);
    return this.prisma.partnerLab.update({ where: { id }, data: dto });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.partnerLab.delete({ where: { id } });
    return { deleted: true };
  }
}
