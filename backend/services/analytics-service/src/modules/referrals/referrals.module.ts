import { Module } from '@nestjs/common';
import { ReferralsController } from './referrals.controller';
import { ReferralsAnalyticsService } from './referrals.service';

@Module({
  controllers: [ReferralsController],
  providers: [ReferralsAnalyticsService],
})
export class ReferralsModule {}
