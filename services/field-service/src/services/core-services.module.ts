import { Module } from '@nestjs/common';
import { RouteOptimizerService } from './route-optimizer.service';

@Module({
  providers: [RouteOptimizerService],
  exports: [RouteOptimizerService],
})
export class CoreServicesModule {}
