import { Module } from '@nestjs/common';
import { FranchiseController } from './franchise.controller';
import { FranchiseService } from './franchise.service';

@Module({
  controllers: [FranchiseController],
  providers: [FranchiseService],
})
export class FranchiseModule {}
