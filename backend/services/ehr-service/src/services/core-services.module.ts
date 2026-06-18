import { Global, Module } from '@nestjs/common';
import { EhrSequenceService } from './ehr-sequence.service';

@Global()
@Module({
  providers: [EhrSequenceService],
  exports: [EhrSequenceService],
})
export class CoreServicesModule {}
