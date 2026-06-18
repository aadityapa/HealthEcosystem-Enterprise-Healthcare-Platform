import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, logLevel } from 'kafkajs';
import type { DomainEvent } from '@health/shared-types';
import type { EventPublisher } from '@health/events';
import { createLogger } from '@health/logger';
import { KAFKA_TOPICS } from './kafka.constants';

const logger = createLogger({ service: 'device-service-kafka' });

const TOPIC_BY_EVENT: Record<string, string> = {
  'device.message.received': KAFKA_TOPICS.MESSAGES,
  'device.result_parsed': KAFKA_TOPICS.RESULTS,
  'device.result.imported': KAFKA_TOPICS.RESULTS,
  'device.error': KAFKA_TOPICS.ERRORS,
  'device.heartbeat': KAFKA_TOPICS.HEARTBEAT,
  'device.registered': KAFKA_TOPICS.MESSAGES,
  'device.offline': KAFKA_TOPICS.ERRORS,
};

@Injectable()
export class KafkaEventPublisher implements EventPublisher, OnModuleInit, OnModuleDestroy {
  private producer: Producer | null = null;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.enabled = Boolean(config.get<string>('KAFKA_BROKERS'));
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled) return;

    const brokers = (this.config.get<string>('KAFKA_BROKERS') ?? '')
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    const kafka = new Kafka({
      clientId: this.config.get<string>('KAFKA_CLIENT_ID') ?? 'device-service',
      brokers,
      logLevel: logLevel.WARN,
    });

    this.producer = kafka.producer();
    await this.producer.connect();
    logger.info(`Kafka producer connected: ${brokers.join(',')}`);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    if (!this.producer) return;

    const topic = TOPIC_BY_EVENT[event.eventType] ?? KAFKA_TOPICS.MESSAGES;
    await this.producer.send({
      topic,
      messages: [
        {
          key: event.aggregateId,
          value: JSON.stringify(event),
          headers: {
            eventType: event.eventType,
            tenantId: event.tenantId,
          },
        },
      ],
    });
  }
}
