import { Module } from '@nestjs/common';
import { LakeController } from './lake.controller';
import { LakeService } from './lake.service';

@Module({
  controllers: [LakeController],
  providers: [LakeService],
  exports: [LakeService],
})
export class LakeModule {}
