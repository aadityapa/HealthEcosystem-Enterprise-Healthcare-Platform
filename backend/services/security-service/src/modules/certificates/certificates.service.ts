import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@/common/dto/pagination.dto';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CertificateMonitorService } from '@/services/certificate-monitor.service';
import { CreateCertificateDto, UpdateCertificateDto } from './dto/certificates.dto';

@Injectable()
export class CertificatesService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly certificateMonitor: CertificateMonitorService,
  ) {}

  async list(ctx: ServiceRequestContext, query: PaginationDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = { tenantId: ctx.tenantId };

    const [items, total] = await Promise.all([
      this.prisma.certificateRecord.findMany({
        where,
        skip,
        take,
        orderBy: { validTo: 'asc' },
      }),
      this.prisma.certificateRecord.count({ where }),
    ]);

    const withAlerts = this.certificateMonitor.assessAll(items);

    return {
      items: items.map((cert, i) => ({
        ...cert,
        expiryStatus: withAlerts[i],
      })),
      meta: paginationMeta(total, page, limit),
    };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const cert = await this.prisma.certificateRecord.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!cert) throw new NotFoundException('Certificate not found');
    return {
      ...cert,
      expiryStatus: this.certificateMonitor.assessCertificate(cert),
    };
  }

  async create(ctx: ServiceRequestContext, dto: CreateCertificateDto) {
    const cert = await this.prisma.certificateRecord.create({
      data: {
        tenantId: ctx.tenantId,
        domain: dto.domain,
        issuer: dto.issuer,
        serialNumber: dto.serialNumber,
        validFrom: new Date(dto.validFrom),
        validTo: new Date(dto.validTo),
        autoRenew: dto.autoRenew ?? true,
        lastCheckedAt: new Date(),
      },
    });

    return {
      ...cert,
      expiryStatus: this.certificateMonitor.assessCertificate(cert),
    };
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateCertificateDto) {
    await this.getById(ctx, id);
    const cert = await this.prisma.certificateRecord.update({
      where: { id },
      data: {
        ...(dto.domain !== undefined && { domain: dto.domain }),
        ...(dto.issuer !== undefined && { issuer: dto.issuer }),
        ...(dto.serialNumber !== undefined && { serialNumber: dto.serialNumber }),
        ...(dto.validFrom !== undefined && { validFrom: new Date(dto.validFrom) }),
        ...(dto.validTo !== undefined && { validTo: new Date(dto.validTo) }),
        ...(dto.autoRenew !== undefined && { autoRenew: dto.autoRenew }),
        ...(dto.status !== undefined && { status: dto.status }),
        lastCheckedAt: new Date(),
      },
    });

    return {
      ...cert,
      expiryStatus: this.certificateMonitor.assessCertificate(cert),
    };
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.certificateRecord.delete({ where: { id } });
    return { deleted: true };
  }

  async getExpiryAlerts(ctx: ServiceRequestContext) {
    const certs = await this.prisma.certificateRecord.findMany({
      where: { tenantId: ctx.tenantId },
    });
    return this.certificateMonitor.getExpiringWithinDays(certs, 30);
  }
}
