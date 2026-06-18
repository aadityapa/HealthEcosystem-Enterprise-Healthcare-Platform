import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreServicesModule } from '@/services/core-services.module';
import { FranchiseSettlementService } from './franchise-settlement.service';
import { FranchiseController } from './franchise.controller';
import { FranchiseHandlers } from './handlers/franchise.handlers';

@Module({
  imports: [CqrsModule, CoreServicesModule],
  controllers: [FranchiseController],
  providers: [FranchiseSettlementService, ...FranchiseHandlers],
  exports: [FranchiseSettlementService],
})
export class FranchiseModule {}
