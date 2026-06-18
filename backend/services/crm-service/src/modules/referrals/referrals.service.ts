import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { calculateCommission, toNumber } from '@/common/utils/decimal.util';
import type {
  CreateReferralDto,
  ListReferralsQueryDto,
} from './dto/referrals.dto';

@Injectable()
export class ReferralsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async generateReferralNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.doctorReferral.count({
      where: { tenantId },
    });
    return `REF${String(count + 1).padStart(6, '0')}`;
  }

  async createReferral(ctx: ServiceRequestContext, dto: CreateReferralDto) {
    const doctor = await this.prisma.referringDoctor.findFirst({
      where: {
        id: dto.doctorId,
        tenantId: ctx.tenantId,
        isActive: true,
      },
    });
    if (!doctor) {
      throw new NotFoundException('Referring doctor not found or inactive');
    }

    if (dto.orderAmount <= 0) {
      throw new BadRequestException('Order amount must be greater than zero');
    }

    const commissionPct = toNumber(doctor.commissionPct);
    const commissionAmount = calculateCommission(dto.orderAmount, commissionPct);
    const referralNumber = await this.generateReferralNumber(ctx.tenantId);

    return this.prisma.doctorReferral.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        doctorId: dto.doctorId,
        patientId: dto.patientId,
        referralNumber,
        orderId: dto.orderId,
        orderAmount: dto.orderAmount,
        commissionAmount,
        notes: dto.notes,
      },
      include: { doctor: true },
    });
  }

  async getReferral(ctx: ServiceRequestContext, referralId: string) {
    const referral = await this.prisma.doctorReferral.findFirst({
      where: { id: referralId, tenantId: ctx.tenantId },
      include: { doctor: true },
    });
    if (!referral) throw new NotFoundException('Referral not found');
    return referral;
  }

  async listReferrals(
    ctx: ServiceRequestContext,
    filters: ListReferralsQueryDto,
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where = {
      tenantId: ctx.tenantId,
      ...(filters.doctorId && { doctorId: filters.doctorId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.doctorReferral.findMany({
        where,
        skip,
        take,
        orderBy: { referredAt: 'desc' },
        include: { doctor: true },
      }),
      this.prisma.doctorReferral.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }
}
