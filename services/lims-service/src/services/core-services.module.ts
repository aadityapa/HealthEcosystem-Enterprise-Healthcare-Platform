import { Module } from '@nestjs/common';
import { SequenceService, BarcodeService, OrderNumberService } from './sequence.service';
import { SampleWorkflowService } from './sample-workflow.service';
import { ResultValidationService } from './result-validation.service';

@Module({
  providers: [
    SequenceService,
    BarcodeService,
    OrderNumberService,
    SampleWorkflowService,
    ResultValidationService,
  ],
  exports: [
    SequenceService,
    BarcodeService,
    OrderNumberService,
    SampleWorkflowService,
    ResultValidationService,
  ],
})
export class CoreServicesModule {}
