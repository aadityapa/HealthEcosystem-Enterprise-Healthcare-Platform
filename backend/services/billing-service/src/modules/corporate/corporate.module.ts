import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreServicesModule } from '@/services/core-services.module';
import { CorporateService } from './corporate.service';
import { CorporateController } from './corporate.controller';
import { CorporateHandlers } from './handlers/corporate.handlers';

@Module({
  imports: [CqrsModule, CoreServicesModule],
  controllers: [CorporateController],
  providers: [CorporateService, ...CorporateHandlers],
  exports: [CorporateService],
})
export class CorporateModule {}
