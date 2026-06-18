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
  CreateDoctorDto,
  ListDoctorsQueryDto,
  UpdateDoctorDto,
} from './dto/doctors.dto';

@Injectable()
export class DoctorsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async createDoctor(ctx: ServiceRequestContext, dto: CreateDoctorDto) {
    const existing = await this.prisma.referringDoctor.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Doctor code "${dto.code}" already exists`);
    }

    return this.prisma.referringDoctor.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        specialty: dto.specialty,
        qualification: dto.qualification,
        registrationNo: dto.registrationNo,
        phone: dto.phone,
        email: dto.email,
        clinicName: dto.clinicName,
        address: (dto.address ?? {}) as Prisma.InputJsonValue,
        commissionPct: dto.commissionPct ?? 0,
      },
    });
  }

  async getDoctor(ctx: ServiceRequestContext, doctorId: string) {
    const doctor = await this.prisma.referringDoctor.findFirst({
      where: { id: doctorId, tenantId: ctx.tenantId },
    });
    if (!doctor) throw new NotFoundException('Referring doctor not found');
    return doctor;
  }

  async listDoctors(ctx: ServiceRequestContext, filters: ListDoctorsQueryDto) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const trimmed = filters.q?.trim();

    const where: Prisma.ReferringDoctorWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(trimmed && {
        OR: [
          { code: { contains: trimmed, mode: 'insensitive' } },
          { name: { contains: trimmed, mode: 'insensitive' } },
          { phone: { contains: trimmed } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.referringDoctor.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.referringDoctor.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async updateDoctor(
    ctx: ServiceRequestContext,
    doctorId: string,
    dto: UpdateDoctorDto,
  ) {
    await this.getDoctor(ctx, doctorId);

    if (dto.code) {
      const duplicate = await this.prisma.referringDoctor.findFirst({
        where: {
          tenantId: ctx.tenantId,
          code: dto.code,
          NOT: { id: doctorId },
        },
      });
      if (duplicate) {
        throw new ConflictException(`Doctor code "${dto.code}" already exists`);
      }
    }

    const { address, ...rest } = dto;

    return this.prisma.referringDoctor.update({
      where: { id: doctorId },
      data: {
        ...rest,
        ...(address !== undefined && {
          address: address as Prisma.InputJsonValue,
        }),
      },
    });
  }

  async deleteDoctor(ctx: ServiceRequestContext, doctorId: string) {
    await this.getDoctor(ctx, doctorId);
    return this.prisma.referringDoctor.update({
      where: { id: doctorId },
      data: { isActive: false },
    });
  }
}
