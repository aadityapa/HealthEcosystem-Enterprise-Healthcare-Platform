import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, type Consumer } from 'kafkajs';
import { createLogger } from '@health/logger';
import { ClickHouseService } from './clickhouse.service';

const ANALYTICS_TOPICS = [
  'lims.events',
  'billing.events',
  'device.events',
  'qc.events',
  'crm.events',
] as const;

const DOMAIN_EVENT_TYPES = [
  'lims.order.created',
  'lims.sample.collected',
  'lims.result.verified',
  'billing.invoice.issued',
  'billing.payment.received',
  'device.message.received',
  'qc.run.completed',
  'crm.referral.created',
] as const;

@Injectable()
export class KafkaStreamsConsumer implements OnModuleInit, OnModuleDestroy {
  private consumer: Consumer | null = null;
  private readonly logger = createLogger({ service: 'analytics-kafka' });

  constructor(
    private readonly config: ConfigService,
    private readonly clickhouse: ClickHouseService,
  ) {}

  async onModuleInit(): Promise<void> {
    const brokers = this.config.get<string>('KAFKA_BROKERS');
    if (!brokers) {
      this.logger.info(
        'KAFKA_BROKERS not set; analytics stream consumer running in stub mode (events logged only)',
      );
      return;
    }

    try {
      const kafka = new Kafka({
        clientId: 'analytics-service',
        brokers: brokers.split(',').map((b) => b.trim()),
      });
      this.consumer = kafka.consumer({ groupId: 'analytics-service-streams' });
      await this.consumer.connect();

      for (const topic of ANALYTICS_TOPICS) {
        await this.consumer.subscribe({ topic, fromBeginning: false });
      }

      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          const payload = message.value?.toString() ?? '{}';
          await this.handleDomainEvent(topic, payload);
        },
      });

      this.logger.info('Kafka streams consumer connected');
    } catch (err) {
      this.logger.warn({ err }, 'Kafka unavailable; falling back to stub mode');
      this.consumer = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }

  async handleDomainEvent(topic: string, rawPayload: string): Promise<void> {
    let event: { eventType?: string; tenantId?: string; payload?: unknown };
    try {
      event = JSON.parse(rawPayload) as typeof event;
    } catch {
      this.logger.warn({ topic }, 'Skipping malformed Kafka message');
      return;
    }

    const eventType = event.eventType ?? 'unknown';
    if (!DOMAIN_EVENT_TYPES.includes(eventType as (typeof DOMAIN_EVENT_TYPES)[number])) {
      return;
    }

    if (this.clickhouse.isClickHouseAvailable()) {
      this.logger.debug(
        { topic, eventType, tenantId: event.tenantId },
        'Would ingest event into ClickHouse',
      );
    } else {
      this.logger.info(
        { topic, eventType, tenantId: event.tenantId },
        'Domain event received (stub mode; would populate ClickHouse when available)',
      );
    }
  }
}
