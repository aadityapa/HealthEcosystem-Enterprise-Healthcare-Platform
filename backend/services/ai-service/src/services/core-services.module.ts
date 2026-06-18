import { Global, Module } from '@nestjs/common';
import { InferenceEngine } from './inference.engine';
import { InferenceLogService } from './inference-log.service';

@Global()
@Module({
  providers: [InferenceEngine, InferenceLogService],
  exports: [InferenceEngine, InferenceLogService],
})
export class CoreServicesModule {}
