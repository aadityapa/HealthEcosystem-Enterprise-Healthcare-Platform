import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLogger } from '@health/logger';

export interface KafkaIngestResult {
  topic: string;
  messagesConsumed: number;
  status: 'stub' | 'completed';
}

@Injectable()
export class KafkaIngestService {
  private readonly logger = createLogger({ service: 'data-kafka-ingest' });

  constructor(private readonly config: ConfigService) {}

  async consumeTopic(topic: string, maxMessages = 1000): Promise<KafkaIngestResult> {
    const brokers = this.config.get<string>('KAFKA_BROKERS');
    this.logger.info({ topic, brokers: brokers ?? 'not-configured' }, 'Kafka ingest stub');

    return {
      topic,
      messagesConsumed: Math.min(maxMessages, 250),
      status: 'stub',
    };
  }
}
