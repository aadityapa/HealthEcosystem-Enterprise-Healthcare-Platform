import { Module } from '@nestjs/common';
import { AgentsServicesModule } from '@/services/agents-services.module';
import { ManagementAgentController } from './management-agent.controller';

@Module({
  imports: [AgentsServicesModule],
  controllers: [ManagementAgentController],
})
export class ManagementAgentModule {}
