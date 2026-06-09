import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InMemoryEventPublisher } from '@health/events';
import { KafkaEventPublisher } from './kafka-event.publisher';
import { EVENT_PUBLISHER } from './kafka.constants';

@Global()
@Module({
  providers: [
    KafkaEventPublisher,
    {
      provide: EVENT_PUBLISHER,
      inject: [ConfigService, KafkaEventPublisher],
      useFactory: (config: ConfigService, kafkaPublisher: KafkaEventPublisher) => {
        const brokers = config.get<string>('KAFKA_BROKERS');
        return brokers ? kafkaPublisher : new InMemoryEventPublisher();
      },
    },
  ],
  exports: [EVENT_PUBLISHER, KafkaEventPublisher],
})
export class KafkaModule {}
