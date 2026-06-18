import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '@health/validation';

export class CreatePipelineDto {
  @IsString()
  @MaxLength(128)
  pipelineName!: string;

  @IsString()
  @MaxLength(128)
  sourceTopic!: string;

  @IsString()
  @MaxLength(512)
  lakePath!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  warehouseTable?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class UpdatePipelineDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  pipelineName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  sourceTopic?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  lakePath?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  warehouseTable?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class ListPipelinesQueryDto extends PaginationDto {}
