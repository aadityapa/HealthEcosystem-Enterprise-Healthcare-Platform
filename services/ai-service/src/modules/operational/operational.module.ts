import { Module } from '@nestjs/common';
import { OperationalController } from './operational.controller';
import { OperationalService } from './operational.service';

@Module({
  controllers: [OperationalController],
  providers: [OperationalService],
})
export class OperationalModule {}
