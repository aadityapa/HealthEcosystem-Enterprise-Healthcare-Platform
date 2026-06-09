import { Global, Module } from '@nestjs/common';
import { AbdmSequenceService } from './abdm-sequence.service';

@Global()
@Module({
  providers: [AbdmSequenceService],
  exports: [AbdmSequenceService],
})
export class CoreServicesModule {}
