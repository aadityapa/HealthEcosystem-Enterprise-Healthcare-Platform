import { Module } from '@nestjs/common';
import { ServiceMapController } from './service-map.controller';
import { ServiceMapService } from './service-map.service';

@Module({
  controllers: [ServiceMapController],
  providers: [ServiceMapService],
  exports: [ServiceMapService],
})
export class ServiceMapModule {}
