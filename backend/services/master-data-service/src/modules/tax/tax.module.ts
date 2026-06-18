import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TaxController } from './tax.controller';
import { TaxService } from './tax.service';
import { TaxHandlers } from './handlers/tax.handlers';

@Module({
  imports: [CqrsModule],
  controllers: [TaxController],
  providers: [TaxService, ...TaxHandlers],
})
export class TaxModule {}
