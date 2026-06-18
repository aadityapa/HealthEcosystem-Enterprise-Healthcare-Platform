import { Module } from '@nestjs/common';
import { ExecutiveController } from './executive.controller';
import { ExecutiveService } from './executive.service';

@Module({
  controllers: [ExecutiveController],
  providers: [ExecutiveService],
})
export class ExecutiveModule {}
