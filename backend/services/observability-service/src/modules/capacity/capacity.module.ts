import { Module } from '@nestjs/common';
import { CapacityController } from './capacity.controller';
import { CapacityService } from './capacity.service';

@Module({
  controllers: [CapacityController],
  providers: [CapacityService],
  exports: [CapacityService],
})
export class CapacityModule {}
