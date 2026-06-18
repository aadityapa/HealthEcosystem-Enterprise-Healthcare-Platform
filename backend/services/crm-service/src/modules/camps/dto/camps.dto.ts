import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { CampStatus } from '@health/db';
import { PaginationDto } from '@health/validation';

export class CreateCampDto {
  @ApiProperty({ example: 'CAMP-2025-01' })
  @IsString()
  @MaxLength(32)
  campCode!: string;

  @ApiProperty({ example: 'Corporate Health Camp' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiProperty({ example: '2025-06-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2025-06-02' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  targetCount?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  packageIds?: string[];
}

export class UpdateCampDto extends PartialType(CreateCampDto) {
  @ApiPropertyOptional({ enum: CampStatus })
  @IsOptional()
  @IsEnum(CampStatus)
  status?: CampStatus;
}

export class RegisterCampPatientDto {
  @ApiProperty({ example: 'Ravi Kumar' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class ListCampsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CampStatus })
  @IsOptional()
  @IsEnum(CampStatus)
  status?: CampStatus;
}
