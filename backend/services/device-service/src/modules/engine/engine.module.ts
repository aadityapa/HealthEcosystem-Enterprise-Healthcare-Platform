import { Module } from '@nestjs/common';
import { IntegrationEngineService } from './integration-engine.service';
import { ProtocolsModule } from '../protocols/protocols.module';
import { AdaptersModule } from '../adapters/adapters.module';

@Module({
  imports: [ProtocolsModule, AdaptersModule],
  providers: [IntegrationEngineService],
  exports: [IntegrationEngineService],
})
export class EngineModule {}
