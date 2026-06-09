import { Module } from '@nestjs/common';
import { WorkflowServicesModule } from '@/services/workflow-services.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [WorkflowServicesModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
