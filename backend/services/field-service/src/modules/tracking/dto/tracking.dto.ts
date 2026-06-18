import {
  IsUUID,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { Type } from 'class-transformer';

export class RecordGpsPingDto {
  @ApiProperty()
  @IsUUID()
  phlebotomistId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  lng!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  accuracy?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  speed?: number;
}

export class GpsHistoryQueryDto extends PaginationDto {
  @ApiProperty()
  @IsUUID()
  phlebotomistId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;
}
