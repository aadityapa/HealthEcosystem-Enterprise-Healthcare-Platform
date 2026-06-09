import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateWorkflowDefinitionDto {
  @IsString()
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @IsString()
  bpmnXml?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  slaMinutes?: number;
}

export class UpdateWorkflowDefinitionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @IsString()
  bpmnXml?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  slaMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListDefinitionsQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
