import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MessageParseStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { DeviceRequestContext } from '@/common/context/device-context';
import { ResultProcessorService } from '../processor/result-processor.service';

export interface ListMessagesFilters {
  deviceId?: string;
  parseStatus?: MessageParseStatus;
  page?: number;
  limit?: number;
}

@Injectable()
export class MessagesService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly resultProcessor: ResultProcessorService,
  ) {}

  async listMessages(ctx: DeviceRequestContext, filters: ListMessagesFilters) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);

    const where = {
      tenantId: ctx.tenantId,
      ...(filters.deviceId && { deviceId: filters.deviceId }),
      ...(filters.parseStatus && { parseStatus: filters.parseStatus }),
    };

    const [items, total] = await Promise.all([
      this.prisma.deviceMessage.findMany({
        where,
        skip,
        take,
        orderBy: { receivedAt: 'desc' },
      }),
      this.prisma.deviceMessage.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async listFailedMessages(ctx: DeviceRequestContext, filters: ListMessagesFilters) {
    return this.listMessages(ctx, {
      ...filters,
      parseStatus: MessageParseStatus.FAILED,
    });
  }

  async retryMessage(ctx: DeviceRequestContext, messageId: string) {
    const message = await this.prisma.deviceMessage.findFirst({
      where: { id: messageId, tenantId: ctx.tenantId },
    });
    if (!message) throw new NotFoundException('Message not found');

    return this.resultProcessor.retryMessage(ctx, messageId);
  }
}
