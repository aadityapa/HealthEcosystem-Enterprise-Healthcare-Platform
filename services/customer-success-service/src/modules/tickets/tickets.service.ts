import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TicketStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateTicketDto, UpdateTicketDto } from './dto/tickets.dto';

@Injectable()
export class TicketsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  private async nextTicketNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.supportTicket.count({ where: { tenantId } });
    return `TKT${String(count + 1).padStart(6, '0')}`;
  }

  async create(ctx: ServiceRequestContext, dto: CreateTicketDto) {
    const ticketNumber = await this.nextTicketNumber(ctx.tenantId);

    return this.prisma.supportTicket.create({
      data: {
        tenantId: ctx.tenantId,
        ticketNumber,
        subject: dto.subject,
        description: dto.description,
        priority: dto.priority ?? 'medium',
        category: dto.category,
        assignedTo: dto.assignedTo,
        createdBy: ctx.userId,
        status: TicketStatus.OPEN,
      },
    });
  }

  async list(ctx: ServiceRequestContext, page = 1, limit = 20, status?: TicketStatus) {
    const { skip, take } = paginate(page, limit);
    const where = {
      tenantId: ctx.tenantId,
      ...(status && { status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!ticket) throw new NotFoundException('Support ticket not found');
    return ticket;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateTicketDto) {
    await this.getById(ctx, id);

    const resolvedAt =
      dto.status === TicketStatus.RESOLVED || dto.status === TicketStatus.CLOSED
        ? new Date()
        : undefined;

    return this.prisma.supportTicket.update({
      where: { id },
      data: { ...dto, ...(resolvedAt && { resolvedAt }) },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.supportTicket.delete({ where: { id } });
    return { deleted: true };
  }
}
