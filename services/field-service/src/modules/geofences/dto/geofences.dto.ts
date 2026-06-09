import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsNotEmpty,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { Type } from 'class-transformer';

export class CreateGeoFenceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  centerLat!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  centerLng!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  radiusMeters!: number;
}

export class UpdateGeoFenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  centerLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  centerLng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  radiusMeters?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListGeoFencesDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
