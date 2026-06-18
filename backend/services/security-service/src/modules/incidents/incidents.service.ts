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
import { CreateIncidentDto, UpdateIncidentDto } from './dto/incidents.dto';

@Injectable()
export class IncidentsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async list(ctx: ServiceRequestContext, query: PaginationDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = { tenantId: ctx.tenantId };

    const [items, total] = await Promise.all([
      this.prisma.securityIncident.findMany({
        where,
        skip,
        take,
        orderBy: { detectedAt: 'desc' },
      }),
      this.prisma.securityIncident.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const incident = await this.prisma.securityIncident.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  async create(ctx: ServiceRequestContext, dto: CreateIncidentDto) {
    const incidentNumber = `INC-${Date.now()}`;
    return this.prisma.securityIncident.create({
      data: {
        tenantId: ctx.tenantId,
        incidentNumber,
        title: dto.title,
        description: dto.description,
        severity: dto.severity ?? 'MEDIUM',
        threatType: dto.threatType,
        sourceIp: dto.sourceIp,
        affectedService: dto.affectedService,
        assignedTo: dto.assignedTo,
      },
    });
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateIncidentDto) {
    await this.getById(ctx, id);

    const resolvedAt =
      dto.status === 'RESOLVED' || dto.status === 'CLOSED'
        ? new Date()
        : undefined;

    return this.prisma.securityIncident.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.severity !== undefined && { severity: dto.severity }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.threatType !== undefined && { threatType: dto.threatType }),
        ...(dto.sourceIp !== undefined && { sourceIp: dto.sourceIp }),
        ...(dto.affectedService !== undefined && { affectedService: dto.affectedService }),
        ...(dto.assignedTo !== undefined && { assignedTo: dto.assignedTo }),
        ...(resolvedAt && { resolvedAt }),
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.securityIncident.delete({ where: { id } });
    return { deleted: true };
  }
}
