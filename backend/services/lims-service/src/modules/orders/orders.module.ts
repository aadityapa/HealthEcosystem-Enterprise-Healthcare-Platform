import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreServicesModule } from '@/services/core-services.module';
import { OrdersService } from './orders.service';
import { OrderHandlers } from './handlers/orders.handlers';
import { OrdersController } from './orders.controller';

@Module({
  imports: [CqrsModule, CoreServicesModule],
  controllers: [OrdersController],
  providers: [OrdersService, ...OrderHandlers],
})
export class OrdersModule {}
