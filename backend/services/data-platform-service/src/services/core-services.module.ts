import { Global, Module } from '@nestjs/common';
import { KafkaIngestService } from './kafka-ingest.service';
import { S3LakeService } from './s3-lake.service';

@Global()
@Module({
  providers: [KafkaIngestService, S3LakeService],
  exports: [KafkaIngestService, S3LakeService],
})
export class CoreServicesModule {}
