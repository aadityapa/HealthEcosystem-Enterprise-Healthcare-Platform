import { Module } from '@nestjs/common';
import { WestgardRulesService } from './westgard-rules.service';

@Module({
  providers: [WestgardRulesService],
  exports: [WestgardRulesService],
})
export class QcServicesModule {}
