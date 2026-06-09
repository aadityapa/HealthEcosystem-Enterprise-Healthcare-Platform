import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  HiuCallbackDto,
  LinkHealthRecordDto,
  ListHealthRecordLinksQueryDto,
} from './dto/exchange.dto';

@Injectable()
export class ExchangeService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async linkHealthRecord(ctx: ServiceRequestContext, dto: LinkHealthRecordDto) {
    const existing = await this.prisma.healthRecordLink.findFirst({
      where: { tenantId: ctx.tenantId, careContextId: dto.careContextId },
    });
    if (existing) {
      throw new ConflictException('Care context is already linked');
    }

    const link = await this.prisma.healthRecordLink.create({
      data: {
        tenantId: ctx.tenantId,
        patientId: dto.patientId,
        abhaNumber: dto.abhaNumber,
        hipId: dto.hipId,
        careContextId: dto.careContextId,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
      },
    });

    await this.prisma.abdmTransaction.create({
      data: {
        tenantId: ctx.tenantId,
        transactionId: `LINK-${dto.careContextId}`,
        requestType: 'health_record_link',
        status: 'completed',
        requestPayload: dto as unknown as Prisma.InputJsonValue,
        responsePayload: { linkId: link.id } as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });

    return link;
  }

  async listHealthRecordLinks(
    ctx: ServiceRequestContext,
    filters: ListHealthRecordLinksQueryDto & { page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.HealthRecordLinkWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.patientId && { patientId: filters.patientId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.healthRecordLink.findMany({
        where,
        skip,
        take,
        orderBy: { linkedAt: 'desc' },
      }),
      this.prisma.healthRecordLink.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async getHealthRecordLink(ctx: ServiceRequestContext, linkId: string) {
    const link = await this.prisma.healthRecordLink.findFirst({
      where: { id: linkId, tenantId: ctx.tenantId },
    });
    if (!link) throw new NotFoundException('Health record link not found');
    return link;
  }

  async hiuCallback(dto: HiuCallbackDto) {
    const existing = await this.prisma.abdmTransaction.findFirst({
      where: { transactionId: dto.transactionId },
    });

    if (existing) {
      return this.prisma.abdmTransaction.update({
        where: { id: existing.id },
        data: {
          status: 'completed',
          responsePayload: (dto.payload ?? {}) as Prisma.InputJsonValue,
          completedAt: new Date(),
        },
      });
    }

    return this.prisma.abdmTransaction.create({
      data: {
        tenantId: '00000000-0000-0000-0000-000000000000',
        transactionId: dto.transactionId,
        requestType: dto.requestType,
        status: 'completed',
        requestPayload: (dto.payload ?? {}) as Prisma.InputJsonValue,
        responsePayload: { acknowledged: true } as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });
  }
}
