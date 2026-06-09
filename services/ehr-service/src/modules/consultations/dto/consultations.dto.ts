import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ConsultationStatus } from '@health/db';

export class CreateConsultationDto {
  @ApiProperty()
  @IsUUID()
  patientId!: string;

  @ApiProperty()
  @IsUUID()
  doctorId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chiefComplaint?: string;
}

export class ListConsultationsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ enum: ConsultationStatus })
  @IsOptional()
  @IsString()
  status?: ConsultationStatus;
}

export class CompleteConsultationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnosis?: string;
}

export class AddClinicalNoteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  noteType!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content!: string;
}
