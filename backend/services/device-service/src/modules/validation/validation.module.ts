import { Module } from '@nestjs/common';
import { ClinicalValidationEngineService } from './clinical-validation.service';

@Module({
  providers: [ClinicalValidationEngineService],
  exports: [ClinicalValidationEngineService],
})
export class ValidationModule {}
