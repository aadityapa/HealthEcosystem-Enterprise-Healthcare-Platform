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
import {
  CreateVulnerabilityScanDto,
  UpdateVulnerabilityScanDto,
} from './dto/vulnerabilities.dto';

@Injectable()
export class VulnerabilitiesService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async listScans(ctx: ServiceRequestContext, query: PaginationDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = { tenantId: ctx.tenantId };

    const [items, total] = await Promise.all([
      this.prisma.vulnerabilityScan.findMany({
        where,
        skip,
        take,
        orderBy: { scannedAt: 'desc' },
        include: { findings: true },
      }),
      this.prisma.vulnerabilityScan.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async getScan(ctx: ServiceRequestContext, id: string) {
    const scan = await this.prisma.vulnerabilityScan.findFirst({
      where: { id, tenantId: ctx.tenantId },
      include: { findings: true },
    });
    if (!scan) throw new NotFoundException('Vulnerability scan not found');
    return scan;
  }

  async createScan(ctx: ServiceRequestContext, dto: CreateVulnerabilityScanDto) {
    const findings = dto.findings ?? [];
    const criticalCount = findings.filter((f) => f.severity === 'critical').length;
    const highCount = findings.filter((f) => f.severity === 'high').length;

    return this.prisma.vulnerabilityScan.create({
      data: {
        tenantId: ctx.tenantId,
        scanNumber: `VULN-${Date.now()}`,
        scanType: dto.scanType,
        target: dto.target,
        status: dto.status ?? 'completed',
        findingsCount: findings.length,
        criticalCount,
        highCount,
        findings: {
          create: findings.map((f) => ({
            cveId: f.cveId,
            severity: f.severity,
            title: f.title,
            description: f.description,
            remediation: f.remediation,
          })),
        },
      },
      include: { findings: true },
    });
  }

  async updateScan(
    ctx: ServiceRequestContext,
    id: string,
    dto: UpdateVulnerabilityScanDto,
  ) {
    await this.getScan(ctx, id);
    return this.prisma.vulnerabilityScan.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.reportUrl !== undefined && { reportUrl: dto.reportUrl }),
        ...(dto.findingsCount !== undefined && { findingsCount: dto.findingsCount }),
        ...(dto.criticalCount !== undefined && { criticalCount: dto.criticalCount }),
        ...(dto.highCount !== undefined && { highCount: dto.highCount }),
      },
      include: { findings: true },
    });
  }

  async removeScan(ctx: ServiceRequestContext, id: string) {
    await this.getScan(ctx, id);
    await this.prisma.vulnerabilityScan.delete({ where: { id } });
    return { deleted: true };
  }

  async listFindings(ctx: ServiceRequestContext, query: PaginationDto, scanId?: string) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = scanId
      ? { scanId, scan: { tenantId: ctx.tenantId } }
      : { scan: { tenantId: ctx.tenantId } };

    const [items, total] = await Promise.all([
      this.prisma.vulnerabilityFinding.findMany({
        where,
        skip,
        take,
        orderBy: { severity: 'desc' },
      }),
      this.prisma.vulnerabilityFinding.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }
}
