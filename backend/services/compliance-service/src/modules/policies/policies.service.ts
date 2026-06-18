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
import { CreatePolicyDto, UpdatePolicyDto } from './dto/policies.dto';

@Injectable()
export class PoliciesService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async list(ctx: ServiceRequestContext, query: PaginationDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = { tenantId: ctx.tenantId };

    const [items, total] = await Promise.all([
      this.prisma.policyDocument.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.policyDocument.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const policy = await this.prisma.policyDocument.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!policy) throw new NotFoundException('Policy not found');
    return policy;
  }

  async create(ctx: ServiceRequestContext, dto: CreatePolicyDto) {
    return this.prisma.policyDocument.create({
      data: {
        tenantId: ctx.tenantId,
        policyCode: dto.policyCode,
        title: dto.title,
        category: dto.category,
        content: dto.content,
        effectiveFrom: new Date(dto.effectiveFrom),
        reviewDueAt: dto.reviewDueAt ? new Date(dto.reviewDueAt) : undefined,
      },
    });
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdatePolicyDto) {
    await this.getById(ctx, id);
    return this.prisma.policyDocument.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.effectiveFrom !== undefined && { effectiveFrom: new Date(dto.effectiveFrom) }),
        ...(dto.reviewDueAt !== undefined && { reviewDueAt: new Date(dto.reviewDueAt) }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.policyDocument.delete({ where: { id } });
    return { deleted: true };
  }
}
