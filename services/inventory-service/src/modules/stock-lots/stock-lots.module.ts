import { Module } from '@nestjs/common';
import { StockLotsController } from './stock-lots.controller';
import { StockLotsService } from './stock-lots.service';

@Module({
  controllers: [StockLotsController],
  providers: [StockLotsService],
  exports: [StockLotsService],
})
export class StockLotsModule {}
