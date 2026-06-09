import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TestMasterService } from './test-master.service';
import { TestMasterHandlers } from './handlers/test-master.handlers';
import { TestsController } from './tests.controller';
import { PackagesController } from './packages.controller';
import { PricingController } from './pricing.controller';

@Module({
  imports: [CqrsModule],
  controllers: [TestsController, PackagesController, PricingController],
  providers: [TestMasterService, ...TestMasterHandlers],
})
export class TestMasterModule {}
