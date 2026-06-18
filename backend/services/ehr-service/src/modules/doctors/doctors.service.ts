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
import type { CreateDoctorDto, ListDoctorsQueryDto, UpdateDoctorDto } from './dto/doctors.dto';

@Injectable()
export class DoctorsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateDoctorDto) {
    const existing = await this.prisma.ehrDoctor.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Doctor code "${dto.code}" already exists`);
    }

    return this.prisma.ehrDoctor.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        userId: dto.userId,
        code: dto.code,
        name: dto.name,
        specialty: dto.specialty,
        qualification: dto.qualification,
        registrationNo: dto.registrationNo,
        consultationFee: dto.consultationFee ?? 0,
      },
    });
  }

  async get(ctx: ServiceRequestContext, doctorId: string) {
    const doctor = await this.prisma.ehrDoctor.findFirst({
      where: { id: doctorId, tenantId: ctx.tenantId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListDoctorsQueryDto & { page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.EhrDoctorWhereInput = {
      tenantId: ctx.tenantId,
      organizationId: ctx.organizationId,
      ...(filters.specialty && { specialty: filters.specialty }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.ehrDoctor.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.ehrDoctor.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async update(ctx: ServiceRequestContext, doctorId: string, dto: UpdateDoctorDto) {
    await this.get(ctx, doctorId);
    return this.prisma.ehrDoctor.update({
      where: { id: doctorId },
      data: dto,
    });
  }
}
