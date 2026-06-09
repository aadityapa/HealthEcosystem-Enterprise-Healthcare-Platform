import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS } from '@/redis/redis.module';

const RETRY_QUEUE_KEY = 'device:retry:queue';

export interface RetryQueueItem {
  id: string;
  deviceId: string;
  messageId: string;
  tenantId: string;
  payload: string;
  attempt: number;
  maxAttempts: number;
  scheduledAt: number;
  errorMessage?: string;
}

@Injectable()
export class RetryQueueService {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async enqueue(item: RetryQueueItem): Promise<void> {
    await this.redis.zadd(RETRY_QUEUE_KEY, item.scheduledAt, JSON.stringify(item));
  }

  async dequeueDue(now = Date.now(), limit = 10): Promise<RetryQueueItem[]> {
    const raw = await this.redis.zrangebyscore(RETRY_QUEUE_KEY, 0, now, 'LIMIT', 0, limit);
    const items: RetryQueueItem[] = [];

    for (const entry of raw) {
      const item = JSON.parse(entry) as RetryQueueItem;
      items.push(item);
      await this.redis.zrem(RETRY_QUEUE_KEY, entry);
    }

    return items;
  }

  async reschedule(item: RetryQueueItem, delayMs: number): Promise<void> {
    const next: RetryQueueItem = {
      ...item,
      attempt: item.attempt + 1,
      scheduledAt: Date.now() + delayMs,
    };
    await this.enqueue(next);
  }

  async depth(): Promise<number> {
    return this.redis.zcard(RETRY_QUEUE_KEY);
  }

  async remove(itemId: string): Promise<void> {
    const all = await this.redis.zrange(RETRY_QUEUE_KEY, 0, -1);
    for (const entry of all) {
      const item = JSON.parse(entry) as RetryQueueItem;
      if (item.id === itemId) {
        await this.redis.zrem(RETRY_QUEUE_KEY, entry);
      }
    }
  }
}
