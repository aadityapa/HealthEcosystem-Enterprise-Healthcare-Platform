import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BillingCodesController } from './billing-codes.controller';
import { BillingCodesService } from './billing-codes.service';
import { BillingCodesHandlers } from './handlers/billing-codes.handlers';

@Module({
  imports: [CqrsModule],
  controllers: [BillingCodesController],
  providers: [BillingCodesService, ...BillingCodesHandlers],
})
export class BillingCodesModule {}
