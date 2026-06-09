import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { OnboardingStatus } from '@health/db';

export class CreateOnboardingDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  currentStep?: string;

  @IsOptional()
  @IsDateString()
  targetGoLive?: string;

  @IsOptional()
  @IsUUID()
  assignedCsm?: string;

  @IsOptional()
  @IsArray()
  checklist?: unknown[];
}

export class UpdateOnboardingDto {
  @IsOptional()
  @IsEnum(OnboardingStatus)
  status?: OnboardingStatus;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  currentStep?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progressPct?: number;

  @IsOptional()
  @IsUUID()
  assignedCsm?: string;

  @IsOptional()
  @IsDateString()
  targetGoLive?: string;

  @IsOptional()
  @IsArray()
  checklist?: unknown[];
}
