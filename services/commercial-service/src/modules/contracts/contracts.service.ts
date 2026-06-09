import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateContractDto, UpdateContractDto } from './dto/contracts.dto';

@Injectable()
export class ContractsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  private async nextContractNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.partnerContract.count({ where: { tenantId } });
    return `CTR${String(count + 1).padStart(6, '0')}`;
  }

  async create(ctx: ServiceRequestContext, dto: CreateContractDto) {
    const contractNumber = await this.nextContractNumber(ctx.tenantId);

    return this.prisma.partnerContract.create({
      data: {
        tenantId: ctx.tenantId,
        contractNumber,
        partnerType: dto.partnerType,
        partnerName: dto.partnerName,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        value: dto.value,
        terms: (dto.terms ?? {}) as Prisma.InputJsonValue,
        status: 'active',
      },
    });
  }

  async list(ctx: ServiceRequestContext, page = 1, limit = 20, status?: string) {
    const { skip, take } = paginate(page, limit);
    const where = {
      tenantId: ctx.tenantId,
      ...(status && { status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.partnerContract.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.partnerContract.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const contract = await this.prisma.partnerContract.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!contract) throw new NotFoundException('Partner contract not found');
    return contract;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateContractDto) {
    await this.getById(ctx, id);
    const { terms, endDate, ...rest } = dto;
    return this.prisma.partnerContract.update({
      where: { id },
      data: {
        ...rest,
        ...(terms !== undefined && { terms: terms as Prisma.InputJsonValue }),
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.partnerContract.delete({ where: { id } });
    return { deleted: true };
  }
}
