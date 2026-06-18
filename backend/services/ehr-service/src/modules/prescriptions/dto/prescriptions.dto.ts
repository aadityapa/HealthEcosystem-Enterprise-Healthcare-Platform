import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionLineDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  drugName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  dosage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  frequency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  duration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty()
  @IsUUID()
  consultationId!: string;

  @ApiProperty()
  @IsUUID()
  doctorId!: string;

  @ApiProperty()
  @IsUUID()
  patientId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [PrescriptionLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionLineDto)
  lines!: PrescriptionLineDto[];
}

export class ListPrescriptionsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  consultationId?: string;
}
