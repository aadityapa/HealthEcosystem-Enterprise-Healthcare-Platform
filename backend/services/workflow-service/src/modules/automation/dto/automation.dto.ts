import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAutomationRuleDto {
  @IsString()
  @MaxLength(128)
  name!: string;

  @IsString()
  @MaxLength(64)
  triggerEvent!: string;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @IsString()
  @MaxLength(64)
  workflowCode!: string;
}

export class UpdateAutomationRuleDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  triggerEvent?: string;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  workflowCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListAutomationQueryDto {
  @IsOptional()
  @IsString()
  triggerEvent?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
