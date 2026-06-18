import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CapaStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateCapaDto, ListCapaQueryDto, UpdateCapaDto } from './dto/capa.dto';

@Injectable()
export class CapaService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateCapaDto) {
    const failure = await this.prisma.qcFailure.findFirst({
      where: { id: dto.failureId, tenantId: ctx.tenantId },
      include: { capa: true },
    });
    if (!failure) throw new NotFoundException('QC failure not found');
    if (failure.capa) {
      throw new BadRequestException('CAPA already exists for this failure');
    }

    const capaNumber = dto.capaNumber ?? (await this.nextCapaNumber(ctx.tenantId));

    return this.prisma.capaRecord.create({
      data: {
        tenantId: ctx.tenantId,
        failureId: dto.failureId,
        capaNumber,
        rootCause: dto.rootCause,
        correctiveAction: dto.correctiveAction,
        preventiveAction: dto.preventiveAction,
        assignedTo: dto.assignedTo,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { failure: { include: { run: true } } },
    });
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListCapaQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where = {
      tenantId: ctx.tenantId,
      ...(filters.status ? { status: filters.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.capaRecord.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { failure: { include: { run: true } } },
      }),
      this.prisma.capaRecord.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const capa = await this.prisma.capaRecord.findFirst({
      where: { id, tenantId: ctx.tenantId },
      include: { failure: { include: { run: { include: { material: true } } } } },
    });
    if (!capa) throw new NotFoundException('CAPA record not found');
    return capa;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateCapaDto) {
    await this.getById(ctx, id);

    const closedAt =
      dto.status === CapaStatus.CLOSED ? new Date() : undefined;

    return this.prisma.capaRecord.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        closedAt,
      },
      include: { failure: true },
    });
  }

  private async nextCapaNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.capaRecord.count({ where: { tenantId } });
    const seq = String(count + 1).padStart(6, '0');
    return `CAPA-${seq}`;
  }
}
