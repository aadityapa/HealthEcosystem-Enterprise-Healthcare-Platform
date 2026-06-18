import { Module } from '@nestjs/common';
import { WorkflowServicesModule } from '@/services/workflow-services.module';
import { InstancesController } from './instances.controller';
import { InstancesService } from './instances.service';

@Module({
  imports: [WorkflowServicesModule],
  controllers: [InstancesController],
  providers: [InstancesService],
  exports: [InstancesService],
})
export class InstancesModule {}
