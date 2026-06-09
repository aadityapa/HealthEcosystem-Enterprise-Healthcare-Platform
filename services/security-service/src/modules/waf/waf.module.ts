import { Module } from '@nestjs/common';
import { WafController } from './waf.controller';
import { WafService } from './waf.service';

@Module({
  controllers: [WafController],
  providers: [WafService],
})
export class WafModule {}
