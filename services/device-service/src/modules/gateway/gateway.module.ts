import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { DevicesModule } from '../devices/devices.module';
import { ProcessorModule } from '../processor/processor.module';

@Module({
  imports: [DevicesModule, ProcessorModule],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
