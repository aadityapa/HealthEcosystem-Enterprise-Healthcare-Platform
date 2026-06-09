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
import { CreateEvidenceDto, UpdateEvidenceDto } from './dto/evidence.dto';

@Injectable()
export class EvidenceService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async list(ctx: ServiceRequestContext, query: PaginationDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = { tenantId: ctx.tenantId };

    const [items, total] = await Promise.all([
      this.prisma.auditEvidence.findMany({
        where,
        skip,
        take,
        orderBy: { collectedAt: 'desc' },
        include: { control: { select: { controlCode: true, title: true } } },
      }),
      this.prisma.auditEvidence.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const evidence = await this.prisma.auditEvidence.findFirst({
      where: { id, tenantId: ctx.tenantId },
      include: { control: true },
    });
    if (!evidence) throw new NotFoundException('Evidence not found');
    return evidence;
  }

  async create(ctx: ServiceRequestContext, dto: CreateEvidenceDto) {
    const control = await this.prisma.complianceControl.findUnique({
      where: { id: dto.controlId },
    });
    if (!control) throw new NotFoundException('Control not found');

    const evidence = await this.prisma.auditEvidence.create({
      data: {
        tenantId: ctx.tenantId,
        controlId: dto.controlId,
        evidenceType: dto.evidenceType,
        title: dto.title,
        description: dto.description,
        storageKey: dto.storageKey,
        collectedBy: ctx.userId,
      },
      include: { control: true },
    });

    await this.prisma.complianceControl.update({
      where: { id: dto.controlId },
      data: { evidenceCount: { increment: 1 } },
    });

    return evidence;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateEvidenceDto) {
    await this.getById(ctx, id);
    return this.prisma.auditEvidence.update({
      where: { id },
      data: {
        ...(dto.evidenceType !== undefined && { evidenceType: dto.evidenceType }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.storageKey !== undefined && { storageKey: dto.storageKey }),
      },
      include: { control: true },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    const evidence = await this.getById(ctx, id);
    await this.prisma.auditEvidence.delete({ where: { id } });
    await this.prisma.complianceControl.update({
      where: { id: evidence.controlId },
      data: { evidenceCount: { decrement: 1 } },
    });
    return { deleted: true };
  }
}
