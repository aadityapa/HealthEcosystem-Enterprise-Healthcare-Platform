import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationDto } from '@health/validation';

export class ListCapacityQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  resourceType?: string;
}

export class RecordCapacityMetricDto {
  @IsString()
  @MaxLength(32)
  resourceType!: string;

  @IsString()
  @MaxLength(64)
  resourceName!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  usagePct!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  forecastPct?: number;
}
