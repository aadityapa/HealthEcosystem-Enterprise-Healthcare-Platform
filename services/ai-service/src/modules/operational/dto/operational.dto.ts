import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TimeSeriesPointDto {
  @ApiProperty({ example: '2026-01' })
  @IsString()
  period!: string;

  @ApiProperty({ example: 1200 })
  @IsNumber()
  value!: number;
}

export class ForecastDto {
  @ApiProperty({ type: [TimeSeriesPointDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSeriesPointDto)
  series!: TimeSeriesPointDto[];

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  horizon?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inputRef?: string;
}

export class StaffPlanningDto {
  @ApiProperty({ type: [Number], example: [80, 95, 110, 75] })
  @IsArray()
  @IsNumber({}, { each: true })
  expectedVolume!: number[];

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  staffCapacityPerShift?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  shiftsPerDay?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inputRef?: string;
}
