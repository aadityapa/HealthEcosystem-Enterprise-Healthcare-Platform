import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LeadStatus, Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreateSalesLeadDto,
  ListSalesLeadsQueryDto,
  LogSalesActivityDto,
  UpdateSalesLeadDto,
} from './dto/leads.dto';

@Injectable()
export class LeadsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async generateLeadNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.salesLead.count({ where: { tenantId } });
    return `LD${String(count + 1).padStart(6, '0')}`;
  }

  async createLead(ctx: ServiceRequestContext, dto: CreateSalesLeadDto) {
    const leadNumber = await this.generateLeadNumber(ctx.tenantId);

    return this.prisma.salesLead.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        leadNumber,
        contactName: dto.contactName,
        company: dto.company,
        phone: dto.phone,
        email: dto.email,
        source: dto.source,
        assignedTo: dto.assignedTo,
        value: dto.value,
        status: LeadStatus.NEW,
      },
    });
  }

  async getLead(ctx: ServiceRequestContext, leadId: string) {
    const lead = await this.prisma.salesLead.findFirst({
      where: { id: leadId, tenantId: ctx.tenantId },
      include: {
        activities: { orderBy: { performedAt: 'desc' } },
      },
    });
    if (!lead) throw new NotFoundException('Sales lead not found');
    return lead;
  }

  async listLeads(ctx: ServiceRequestContext, filters: ListSalesLeadsQueryDto) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const trimmed = filters.q?.trim();

    const where: Prisma.SalesLeadWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.status && { status: filters.status }),
      ...(trimmed && {
        OR: [
          { leadNumber: { contains: trimmed, mode: 'insensitive' } },
          { contactName: { contains: trimmed, mode: 'insensitive' } },
          { company: { contains: trimmed, mode: 'insensitive' } },
          { phone: { contains: trimmed } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.salesLead.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.salesLead.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async updateLead(
    ctx: ServiceRequestContext,
    leadId: string,
    dto: UpdateSalesLeadDto,
  ) {
    await this.getLead(ctx, leadId);
    return this.prisma.salesLead.update({
      where: { id: leadId },
      data: dto,
    });
  }

  async logActivity(
    ctx: ServiceRequestContext,
    leadId: string,
    dto: LogSalesActivityDto,
  ) {
    await this.getLead(ctx, leadId);

    const activity = await this.prisma.salesActivity.create({
      data: {
        leadId,
        activityType: dto.activityType,
        notes: dto.notes,
        outcome: dto.outcome,
        performedBy: ctx.userId,
      },
    });

    await this.prisma.salesLead.update({
      where: { id: leadId },
      data: {
        status:
          dto.outcome === 'WON'
            ? LeadStatus.WON
            : dto.outcome === 'LOST'
              ? LeadStatus.LOST
              : LeadStatus.CONTACTED,
      },
    });

    return activity;
  }
}
