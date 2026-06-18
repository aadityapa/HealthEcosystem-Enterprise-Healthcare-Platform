import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import type { DomainEvent } from '@health/shared-types';
import type { EventPublisher } from '@health/events';
import { createLogger } from '@health/logger';
import { BILLING_EVENT_TYPES, KAFKA_TOPICS } from './kafka.constants';

const logger = createLogger({ service: 'billing-service-kafka' });

const TOPIC_BY_EVENT: Record<string, string> = {
  [BILLING_EVENT_TYPES.INVOICE_CREATED]: KAFKA_TOPICS.BILLING,
  [BILLING_EVENT_TYPES.INVOICE_ISSUED]: KAFKA_TOPICS.BILLING,
  [BILLING_EVENT_TYPES.INVOICE_VOIDED]: KAFKA_TOPICS.BILLING,
  [BILLING_EVENT_TYPES.PAYMENT_RECEIVED]: KAFKA_TOPICS.BILLING,
  [BILLING_EVENT_TYPES.PAYMENT_REFUNDED]: KAFKA_TOPICS.BILLING,
  [BILLING_EVENT_TYPES.CLAIM_SUBMITTED]: KAFKA_TOPICS.BILLING,
  [BILLING_EVENT_TYPES.CLAIM_SETTLED]: KAFKA_TOPICS.BILLING,
  [BILLING_EVENT_TYPES.SETTLEMENT_CALCULATED]: KAFKA_TOPICS.BILLING,
};

export type LabOrderEventHandler = (event: DomainEvent) => Promise<void>;

@Injectable()
export class KafkaEventPublisher implements EventPublisher, OnModuleInit, OnModuleDestroy {
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private readonly enabled: boolean;
  private labOrderHandlers: LabOrderEventHandler[] = [];

  constructor(private readonly config: ConfigService) {
    this.enabled = Boolean(config.get<string>('KAFKA_BROKERS'));
  }

  onLabOrderCreated(handler: LabOrderEventHandler): void {
    this.labOrderHandlers.push(handler);
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled) return;

    const brokers = (this.config.get<string>('KAFKA_BROKERS') ?? '')
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    const clientId = this.config.get<string>('KAFKA_CLIENT_ID') ?? 'billing-service';
    const kafka = new Kafka({ clientId, brokers, logLevel: logLevel.WARN });

    this.producer = kafka.producer();
    await this.producer.connect();
    logger.info(`Kafka producer connected: ${brokers.join(',')}`);

    this.consumer = kafka.consumer({ groupId: `${clientId}-lims-consumer` });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: KAFKA_TOPICS.LIMS, fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        try {
          const event = JSON.parse(message.value.toString()) as DomainEvent;
          if (event.eventType === 'lims.order.created') {
            await Promise.all(this.labOrderHandlers.map((h) => h(event)));
          }
        } catch (err) {
          logger.error(`Failed to process LIMS Kafka message: ${String(err)}`);
        }
      },
    });
    logger.info(`Kafka consumer subscribed: ${KAFKA_TOPICS.LIMS}`);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.consumer) await this.consumer.disconnect();
    if (this.producer) await this.producer.disconnect();
  }

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    if (!this.producer) return;

    const topic = TOPIC_BY_EVENT[event.eventType] ?? KAFKA_TOPICS.BILLING;
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
