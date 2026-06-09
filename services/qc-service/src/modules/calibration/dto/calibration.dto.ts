import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCalibrationLogDto {
  @IsUUID()
  deviceId!: string;

  @IsDateString()
  calibratedAt!: string;

  @IsOptional()
  @IsDateString()
  nextDueAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  certificateRef?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class ListCalibrationQueryDto {
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @IsOptional()
  @IsDateString()
  dueBefore?: string;
}
