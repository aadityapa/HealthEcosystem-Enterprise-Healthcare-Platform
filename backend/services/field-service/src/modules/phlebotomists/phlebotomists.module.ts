import { Module } from '@nestjs/common';
import { PhlebotomistsController } from './phlebotomists.controller';
import { PhlebotomistsService } from './phlebotomists.service';

@Module({
  controllers: [PhlebotomistsController],
  providers: [PhlebotomistsService],
  exports: [PhlebotomistsService],
})
export class PhlebotomistsModule {}
