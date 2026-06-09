import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationDto } from '@health/validation';

export class CreateSlaDto {
  @IsString()
  @MaxLength(128)
  name!: string;

  @IsString()
  @MaxLength(64)
  serviceName!: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  targetUptime!: number;

  @IsInt()
  @Min(1)
  targetLatencyMs!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  errorBudgetPct!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  windowDays?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSlaDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  serviceName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  targetUptime?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  targetLatencyMs?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  errorBudgetPct?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  windowDays?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListSlaQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  serviceName?: string;
}

export class ListErrorBudgetsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  slaId?: string;
}
