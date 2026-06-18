import { Global, Module } from '@nestjs/common';
import { OtelCollectorService } from './otel-collector.service';
import { SlaCalculatorService } from './sla-calculator.service';

@Global()
@Module({
  providers: [OtelCollectorService, SlaCalculatorService],
  exports: [OtelCollectorService, SlaCalculatorService],
})
export class CoreServicesModule {}
