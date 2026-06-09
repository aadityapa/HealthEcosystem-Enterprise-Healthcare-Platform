import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreServicesModule } from '@/services/core-services.module';
import { SamplesService } from './samples.service';
import { SampleHandlers } from './handlers/samples.handlers';
import { SamplesController } from './samples.controller';

@Module({
  imports: [CqrsModule, CoreServicesModule],
  controllers: [SamplesController],
  providers: [SamplesService, ...SampleHandlers],
})
export class SamplesModule {}
