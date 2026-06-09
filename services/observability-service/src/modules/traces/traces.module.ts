import { Module } from '@nestjs/common';
import { TracesController } from './traces.controller';
import { TracesService } from './traces.service';

@Module({
  controllers: [TracesController],
  providers: [TracesService],
  exports: [TracesService],
})
export class TracesModule {}
