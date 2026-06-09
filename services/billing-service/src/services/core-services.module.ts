import { Module } from '@nestjs/common';
import { GstCalculationService } from './gst-calculation.service';
import { PricingService } from './pricing.service';
import { BillingSequenceService } from './billing-sequence.service';
import { CreditLimitService } from './credit-limit.service';
import { OutstandingService } from './outstanding.service';
import { SurchargeService } from './surcharge.service';

@Module({
  providers: [
    GstCalculationService,
    PricingService,
    BillingSequenceService,
    CreditLimitService,
    OutstandingService,
    SurchargeService,
  ],
  exports: [
    GstCalculationService,
    PricingService,
    BillingSequenceService,
    CreditLimitService,
    OutstandingService,
    SurchargeService,
  ],
})
export class CoreServicesModule {}
