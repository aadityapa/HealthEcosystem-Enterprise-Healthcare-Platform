import { Module } from '@nestjs/common';
import { SurchargesController } from './surcharges.controller';

@Module({
  controllers: [SurchargesController],
})
export class SurchargesModule {}
