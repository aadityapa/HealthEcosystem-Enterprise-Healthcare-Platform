import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class StartWorkflowInstanceDto {
  @IsUUID()
  definitionId!: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}

export class ListInstancesQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;
}
