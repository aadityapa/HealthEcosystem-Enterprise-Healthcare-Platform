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
import { CreateRiskDto, UpdateRiskDto } from './dto/risks.dto';

@Injectable()
export class RisksService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async list(ctx: ServiceRequestContext, query: PaginationDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = { tenantId: ctx.tenantId };

    const [items, total] = await Promise.all([
      this.prisma.riskRegisterEntry.findMany({
        where,
        skip,
        take,
        orderBy: { riskScore: 'desc' },
      }),
      this.prisma.riskRegisterEntry.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const risk = await this.prisma.riskRegisterEntry.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!risk) throw new NotFoundException('Risk not found');
    return risk;
  }

  async create(ctx: ServiceRequestContext, dto: CreateRiskDto) {
    return this.prisma.riskRegisterEntry.create({
      data: {
        tenantId: ctx.tenantId,
        riskNumber: `RISK-${Date.now()}`,
        title: dto.title,
        category: dto.category,
        likelihood: dto.likelihood,
        impact: dto.impact,
        riskScore: dto.riskScore,
        mitigation: dto.mitigation,
        owner: dto.owner,
      },
    });
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateRiskDto) {
    await this.getById(ctx, id);
    return this.prisma.riskRegisterEntry.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.likelihood !== undefined && { likelihood: dto.likelihood }),
        ...(dto.impact !== undefined && { impact: dto.impact }),
        ...(dto.riskScore !== undefined && { riskScore: dto.riskScore }),
        ...(dto.mitigation !== undefined && { mitigation: dto.mitigation }),
        ...(dto.owner !== undefined && { owner: dto.owner }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.riskRegisterEntry.delete({ where: { id } });
    return { deleted: true };
  }
}
