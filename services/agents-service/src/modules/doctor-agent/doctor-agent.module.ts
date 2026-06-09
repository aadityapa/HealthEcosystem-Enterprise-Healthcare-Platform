import { Module } from '@nestjs/common';
import { AgentsServicesModule } from '@/services/agents-services.module';
import { DoctorAgentController } from './doctor-agent.controller';

@Module({
  imports: [AgentsServicesModule],
  controllers: [DoctorAgentController],
})
export class DoctorAgentModule {}
