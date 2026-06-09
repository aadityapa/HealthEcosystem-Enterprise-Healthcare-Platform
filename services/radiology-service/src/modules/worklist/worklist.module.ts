import { Module } from '@nestjs/common';
import { WorklistController } from './worklist.controller';
import { WorklistService } from './worklist.service';

@Module({
  controllers: [WorklistController],
  providers: [WorklistService],
  exports: [WorklistService],
})
export class WorklistModule {}
