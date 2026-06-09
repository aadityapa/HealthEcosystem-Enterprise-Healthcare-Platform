import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreServicesModule } from '@/services/core-services.module';
import { ResultsService } from './results.service';
import { ResultHandlers } from './handlers/results.handlers';
import { ResultsController } from './results.controller';

@Module({
  imports: [CqrsModule, CoreServicesModule],
  controllers: [ResultsController],
  providers: [ResultsService, ...ResultHandlers],
})
export class ResultsModule {}
