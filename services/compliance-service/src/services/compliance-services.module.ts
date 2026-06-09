import { Module } from '@nestjs/common';
import { CompliancePackSeedService } from './compliance-pack-seed.service';

@Module({
  providers: [CompliancePackSeedService],
  exports: [CompliancePackSeedService],
})
export class ComplianceServicesModule {}
