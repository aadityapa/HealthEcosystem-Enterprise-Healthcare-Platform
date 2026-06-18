import { Module } from '@nestjs/common';
import { ResultProcessorService } from './result-processor.service';
import { EngineModule } from '../engine/engine.module';
import { ValidationModule } from '../validation/validation.module';
import { QueueModule } from '../queue/queue.module';
import { MonitorModule } from '../monitor/monitor.module';

@Module({
  imports: [EngineModule, ValidationModule, QueueModule, MonitorModule],
  providers: [ResultProcessorService],
  exports: [ResultProcessorService],
})
export class ProcessorModule {}
