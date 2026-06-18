import { Module } from '@nestjs/common';
import { AgentsServicesModule } from '@/services/agents-services.module';
import { LabAgentController } from './lab-agent.controller';

@Module({
  imports: [AgentsServicesModule],
  controllers: [LabAgentController],
})
export class LabAgentModule {}
