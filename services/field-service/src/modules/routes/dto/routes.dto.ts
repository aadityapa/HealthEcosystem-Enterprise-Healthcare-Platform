import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsDateString,
  MaxLength,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { Type } from 'class-transformer';
import { RouteStatus } from '@health/db';

export class CreateRouteStopInputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  patientName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  address?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRouteDto {
  @ApiProperty()
  @IsUUID()
  phlebotomistId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  routeNumber!: string;

  @ApiProperty()
  @IsDateString()
  routeDate!: string;

  @ApiProperty({ type: [CreateRouteStopInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteStopInputDto)
  stops!: CreateRouteStopInputDto[];
}

export class ListRoutesDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  phlebotomistId?: string;

  @ApiPropertyOptional({ enum: RouteStatus })
  @IsOptional()
  status?: RouteStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  routeDate?: string;
}

export class OptimizeRouteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  startLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  startLng?: number;
}
