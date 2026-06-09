import { Module } from '@nestjs/common';
import { AgentOrchestratorService } from './agent-orchestrator.service';

@Module({
  providers: [AgentOrchestratorService],
  exports: [AgentOrchestratorService],
})
export class AgentsServicesModule {}
