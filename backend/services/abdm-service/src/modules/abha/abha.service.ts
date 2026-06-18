import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AbhaStatus, Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { LinkAbhaDto, ListAbhaQueryDto, VerifyAbhaDto } from './dto/abha.dto';

@Injectable()
export class AbhaService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async link(ctx: ServiceRequestContext, dto: LinkAbhaDto) {
    const existingPatient = await this.prisma.abhaProfile.findFirst({
      where: { tenantId: ctx.tenantId, patientId: dto.patientId },
    });
    if (existingPatient) {
      throw new ConflictException('Patient already has an ABHA profile linked');
    }

    const existingAbha = await this.prisma.abhaProfile.findFirst({
      where: { abhaNumber: dto.abhaNumber },
    });
    if (existingAbha) {
      throw new ConflictException('ABHA number is already registered');
    }

    return this.prisma.abhaProfile.create({
      data: {
        tenantId: ctx.tenantId,
        patientId: dto.patientId,
        abhaNumber: dto.abhaNumber,
        abhaAddress: dto.abhaAddress,
        kycMethod: dto.kycMethod,
        status: AbhaStatus.PENDING,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async verify(ctx: ServiceRequestContext, profileId: string, dto: VerifyAbhaDto) {
    const profile = await this.get(ctx, profileId);
    if (profile.status === AbhaStatus.REVOKED) {
      throw new ConflictException('ABHA profile has been revoked');
    }

    return this.prisma.abhaProfile.update({
      where: { id: profileId },
      data: {
        status: AbhaStatus.VERIFIED,
        verifiedAt: new Date(),
        kycMethod: dto.kycMethod ?? profile.kycMethod,
      },
    });
  }

  async get(ctx: ServiceRequestContext, profileId: string) {
    const profile = await this.prisma.abhaProfile.findFirst({
      where: { id: profileId, tenantId: ctx.tenantId },
    });
    if (!profile) throw new NotFoundException('ABHA profile not found');
    return profile;
  }

  async getByPatient(ctx: ServiceRequestContext, patientId: string) {
    const profile = await this.prisma.abhaProfile.findFirst({
      where: { tenantId: ctx.tenantId, patientId },
    });
    if (!profile) throw new NotFoundException('ABHA profile not found for patient');
    return profile;
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListAbhaQueryDto & { page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.AbhaProfileWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.patientId && { patientId: filters.patientId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.abhaProfile.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.abhaProfile.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }
}
