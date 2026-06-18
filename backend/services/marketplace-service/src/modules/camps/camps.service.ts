import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateCampBookingDto, ListCampBookingsQueryDto } from './dto/camps.dto';

@Injectable()
export class CampsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async createBooking(ctx: ServiceRequestContext, dto: CreateCampBookingDto) {
    const bookingNumber =
      dto.bookingNumber ?? (await this.nextBookingNumber(ctx.tenantId));

    return this.prisma.campBooking.create({
      data: {
        tenantId: ctx.tenantId,
        campId: dto.campId,
        patientId: dto.patientId,
        bookingNumber,
        name: dto.name,
        phone: dto.phone,
        packageId: dto.packageId,
        status: 'confirmed',
      },
    });
  }

  async listBookings(
    ctx: ServiceRequestContext,
    filters: ListCampBookingsQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where: Prisma.CampBookingWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.campId && { campId: filters.campId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.campBooking.findMany({
        where,
        skip,
        take,
        orderBy: { bookedAt: 'desc' },
      }),
      this.prisma.campBooking.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getBooking(ctx: ServiceRequestContext, id: string) {
    const booking = await this.prisma.campBooking.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!booking) throw new NotFoundException('Camp booking not found');
    return booking;
  }

  private async nextBookingNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.campBooking.count({ where: { tenantId } });
    return `CAMP-${String(count + 1).padStart(6, '0')}`;
  }
}
