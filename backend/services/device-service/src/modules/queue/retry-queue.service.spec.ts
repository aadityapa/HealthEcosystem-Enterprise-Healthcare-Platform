import { RetryQueueService } from './retry-queue.service';

function createMockRedis() {
  const store = new Map<string, number>();
  return {
    zadd: jest.fn(async (key: string, score: number, member: string) => {
      store.set(member, score);
    }),
    zrangebyscore: jest.fn(async (_key: string, _min: number, max: number) => {
      return [...store.entries()]
        .filter(([, score]) => score <= max)
        .map(([member]) => member);
    }),
    zrem: jest.fn(async (_key: string, member: string) => {
      store.delete(member);
    }),
    zcard: jest.fn(async () => store.size),
    zrange: jest.fn(async () => [...store.keys()]),
    store,
  };
}

describe('RetryQueueService', () => {
  let service: RetryQueueService;
  let redis: ReturnType<typeof createMockRedis>;

  beforeEach(() => {
    redis = createMockRedis();
    service = new RetryQueueService(redis as never);
  });

  it('enqueues and dequeues due items', async () => {
    const item = {
      id: 'retry-1',
      deviceId: 'dev-1',
      messageId: 'msg-1',
      tenantId: 'tenant-1',
      payload: 'raw',
      attempt: 1,
      maxAttempts: 5,
      scheduledAt: Date.now() - 1000,
    };

    await service.enqueue(item);
    const due = await service.dequeueDue(Date.now());
    expect(due).toHaveLength(1);
    expect(due[0].id).toBe('retry-1');
  });

  it('reschedules with incremented attempt', async () => {
    const item = {
      id: 'retry-2',
      deviceId: 'dev-1',
      messageId: 'msg-2',
      tenantId: 'tenant-1',
      payload: 'raw',
      attempt: 1,
      maxAttempts: 5,
      scheduledAt: Date.now(),
    };

    await service.reschedule(item, 5000);
    expect(redis.zadd).toHaveBeenCalled();
    const depth = await service.depth();
    expect(depth).toBe(1);
  });

  it('removes item by id', async () => {
    const item = {
      id: 'retry-3',
      deviceId: 'dev-1',
      messageId: 'msg-3',
      tenantId: 'tenant-1',
      payload: 'raw',
      attempt: 1,
      maxAttempts: 5,
      scheduledAt: Date.now(),
    };
    await service.enqueue(item);
    await service.remove('retry-3');
    expect(await service.depth()).toBe(0);
  });
});
