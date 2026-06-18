import { Global, Module } from '@nestjs/common';
import { ClickHouseService } from './clickhouse.service';
import { KafkaStreamsConsumer } from './kafka-streams.consumer';

@Global()
@Module({
  providers: [ClickHouseService, KafkaStreamsConsumer],
  exports: [ClickHouseService, KafkaStreamsConsumer],
})
export class CoreServicesModule {}
