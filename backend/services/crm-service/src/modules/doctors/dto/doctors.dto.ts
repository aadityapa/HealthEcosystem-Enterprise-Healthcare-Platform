import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationDto } from '@health/validation';

export class CreateDoctorDto {
  @ApiProperty({ example: 'DR-001' })
  @IsString()
  @MaxLength(32)
  code!: string;

  @ApiProperty({ example: 'Dr. Ananya Sharma' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'Pathology' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  specialty?: string;

  @ApiPropertyOptional({ example: 'MBBS, MD' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  qualification?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  registrationNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  clinicName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  address?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPct?: number;
}

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListDoctorsQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
