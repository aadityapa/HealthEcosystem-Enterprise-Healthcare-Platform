import { Module } from '@nestjs/common';
import { TaxRulesController } from './tax-rules.controller';
import { TaxRulesService } from './tax-rules.service';

@Module({
  controllers: [TaxRulesController],
  providers: [TaxRulesService],
})
export class TaxRulesModule {}
