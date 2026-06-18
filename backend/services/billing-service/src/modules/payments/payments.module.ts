import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreServicesModule } from '@/services/core-services.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentHandlers } from './handlers/payments.handlers';
import { PaymentGatewayFactory } from './gateways/payment-gateway.factory';

@Module({
  imports: [CqrsModule, CoreServicesModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentGatewayFactory, ...PaymentHandlers],
  exports: [PaymentsService, PaymentGatewayFactory],
})
export class PaymentsModule {}
