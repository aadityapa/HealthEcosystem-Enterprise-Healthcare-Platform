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
    const existing = await this.prisma.partnerAccount.findFirst({
      where: { tenantId: ctx.tenantId, accountCode: dto.accountCode },
    });
    if (existing) throw new ConflictException('Partner account code already exists');

    return this.prisma.partnerAccount.create({
      data: {
        tenantId: ctx.tenantId,
        accountCode: dto.accountCode,
        name: dto.name,
        partnerType: dto.partnerType,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        region: dto.region,
      },
    });
  }

  async list(ctx: ServiceRequestContext, page = 1, limit = 20, partnerType?: string) {
    const { skip, take } = paginate(page, limit);
    const where = {
      tenantId: ctx.tenantId,
      isActive: true,
      ...(partnerType && { partnerType }),
    };

    const [items, total] = await Promise.all([
      this.prisma.partnerAccount.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.partnerAccount.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const partner = await this.prisma.partnerAccount.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!partner) throw new NotFoundException('Partner account not found');
    return partner;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdatePartnerDto) {
    await this.getById(ctx, id);
    return this.prisma.partnerAccount.update({ where: { id }, data: dto });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.partnerAccount.update({
      where: { id },
      data: { isActive: false },
    });
    return { deleted: true };
  }
}
