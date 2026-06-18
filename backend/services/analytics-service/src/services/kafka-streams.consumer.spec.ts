import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { KafkaStreamsConsumer } from './kafka-streams.consumer';
import { ClickHouseService } from './clickhouse.service';

describe('KafkaStreamsConsumer', () => {
  let consumer: KafkaStreamsConsumer;
  let clickhouse: { isClickHouseAvailable: jest.Mock };

  beforeEach(async () => {
    clickhouse = { isClickHouseAvailable: jest.fn().mockReturnValue(false) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaStreamsConsumer,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(undefined) },
        },
        { provide: ClickHouseService, useValue: clickhouse },
      ],
    }).compile();

    consumer = module.get(KafkaStreamsConsumer);
    await consumer.onModuleInit();
  });

  it('handles domain events in stub mode without Kafka', async () => {
    await expect(
      consumer.handleDomainEvent(
        'lims.events',
        JSON.stringify({
          eventType: 'lims.order.created',
          tenantId: 'tenant-1',
          payload: { orderId: 'order-1' },
        }),
      ),
    ).resolves.toBeUndefined();
  });

  it('ignores unknown event types', async () => {
    await expect(
      consumer.handleDomainEvent(
        'lims.events',
        JSON.stringify({ eventType: 'unknown.event', tenantId: 'tenant-1' }),
      ),
    ).resolves.toBeUndefined();
  });

  it('skips malformed Kafka payloads', async () => {
    await expect(
      consumer.handleDomainEvent('lims.events', 'not-json'),
    ).resolves.toBeUndefined();
  });
});
