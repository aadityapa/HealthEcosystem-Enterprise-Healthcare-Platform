import { Module } from '@nestjs/common';
import { AgentsServicesModule } from '@/services/agents-services.module';
import { PatientAgentController } from './patient-agent.controller';

@Module({
  imports: [AgentsServicesModule],
  controllers: [PatientAgentController],
})
export class PatientAgentModule {}
