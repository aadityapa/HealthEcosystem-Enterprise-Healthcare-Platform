import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import type Redis from 'ioredis';
import { PRISMA } from '@/database/database.module';
import { REDIS } from '@/redis/redis.module';

const DLQ_REDIS_KEY = 'device:dlq:items';

export interface DeadLetterInput {
  tenantId: string;
  organizationId: string;
  branchId: string;
  deviceId: string;
  sourceType: string;
  sourceId: string;
  rawPayload: string;
  errorMessage: string;
  retryCount?: number;
}

@Injectable()
export class DeadLetterQueueService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  async push(input: DeadLetterInput): Promise<string> {
    const record = await this.prisma.deadLetterItem.create({
      data: {
        tenantId: input.tenantId,
        organizationId: input.organizationId,
        branchId: input.branchId,
        deviceId: input.deviceId,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        rawPayload: input.rawPayload,
        errorMessage: input.errorMessage,
        retryCount: input.retryCount ?? 0,
      },
    });

    await this.redis.lpush(DLQ_REDIS_KEY, record.id);
    return record.id;
  }

  async depth(tenantId: string): Promise<number> {
    return this.prisma.deadLetterItem.count({
      where: { tenantId, resolvedAt: null },
    });
  }

  async listUnresolved(tenantId: string, limit = 50) {
    return this.prisma.deadLetterItem.findMany({
      where: { tenantId, resolvedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async resolve(id: string, tenantId: string): Promise<void> {
    await this.prisma.deadLetterItem.updateMany({
      where: { id, tenantId },
      data: { resolvedAt: new Date() },
    });
  }
}
