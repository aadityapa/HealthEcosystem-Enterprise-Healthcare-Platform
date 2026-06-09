import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { WorkflowTaskStatus } from '@health/db';

export class ListTasksQueryDto {
  @IsOptional()
  @IsEnum(WorkflowTaskStatus)
  status?: WorkflowTaskStatus;
}

export class CompleteTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  outcome?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class EscalateTaskDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
