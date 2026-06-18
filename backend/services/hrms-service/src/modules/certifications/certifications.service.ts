import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreateCertificationDto,
  ListCertificationsQueryDto,
} from './dto/certifications.dto';

@Injectable()
export class CertificationsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateCertificationDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, tenantId: ctx.tenantId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    return this.prisma.certification.create({
      data: {
        tenantId: ctx.tenantId,
        employeeId: dto.employeeId,
        certName: dto.certName,
        issuingBody: dto.issuingBody,
        certNumber: dto.certNumber,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListCertificationsQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where: Prisma.CertificationWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.employeeId && { employeeId: filters.employeeId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.certification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.certification.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const cert = await this.prisma.certification.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!cert) throw new NotFoundException('Certification not found');
    return cert;
  }
}
