import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlanDto {
  @IsString()
  @MaxLength(32)
  code!: string;

  @IsString()
  @MaxLength(128)
  name!: string;

  @IsString()
  @MaxLength(32)
  tier!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyPrice!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  annualPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxBranches?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxUsers?: number;

  @IsOptional()
  @IsArray()
  features?: unknown[];
}

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  tier?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  annualPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxBranches?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxUsers?: number;

  @IsOptional()
  @IsArray()
  features?: unknown[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
