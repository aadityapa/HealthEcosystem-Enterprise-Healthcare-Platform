import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { DepartmentsHandlers } from './handlers/departments.handlers';

@Module({
  imports: [CqrsModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService, ...DepartmentsHandlers],
})
export class DepartmentsModule {}
