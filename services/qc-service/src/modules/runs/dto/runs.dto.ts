import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QcRunStatus } from '@health/db';

export class CreateQcRunDto {
  @IsUUID()
  materialId!: string;

  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  runNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RecordDataPointDto {
  @Type(() => Number)
  @IsNumber()
  value!: number;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}

export class ListRunsQueryDto {
  @IsOptional()
  @IsUUID()
  materialId?: string;

  @IsOptional()
  @IsString()
  status?: QcRunStatus;
}
