import { Module } from '@nestjs/common';
import { PredictiveController } from './predictive.controller';
import { PredictiveService } from './predictive.service';

@Module({
  controllers: [PredictiveController],
  providers: [PredictiveService],
})
export class PredictiveModule {}
