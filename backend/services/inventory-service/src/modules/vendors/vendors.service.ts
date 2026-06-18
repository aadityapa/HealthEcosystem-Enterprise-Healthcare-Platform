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
import type { CreateVendorDto, ListVendorsDto, UpdateVendorDto } from './dto/vendors.dto';

@Injectable()
export class VendorsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateVendorDto) {
    const existing = await this.prisma.vendor.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Vendor code "${dto.code}" already exists`);
    }

    return this.prisma.vendor.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        contactPerson: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        gstin: dto.gstin,
        address: (dto.address ?? {}) as Prisma.InputJsonValue,
        paymentTermsDays: dto.paymentTermsDays ?? 30,
      },
    });
  }

  async get(ctx: ServiceRequestContext, vendorId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, tenantId: ctx.tenantId },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async list(ctx: ServiceRequestContext, query: ListVendorsDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where: Prisma.VendorWhereInput = {
      tenantId: ctx.tenantId,
      organizationId: ctx.organizationId,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.vendor.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async update(ctx: ServiceRequestContext, vendorId: string, dto: UpdateVendorDto) {
    await this.get(ctx, vendorId);

    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: {
        ...dto,
        address: dto.address
          ? (dto.address as Prisma.InputJsonValue)
          : undefined,
      },
    });
  }
}
