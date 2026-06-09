import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InsuranceService } from './insurance.service';
import { InsuranceController } from './insurance.controller';
import { InsuranceHandlers } from './handlers/insurance.handlers';

@Module({
  imports: [CqrsModule],
  controllers: [InsuranceController],
  providers: [InsuranceService, ...InsuranceHandlers],
  exports: [InsuranceService],
})
export class InsuranceModule {}
