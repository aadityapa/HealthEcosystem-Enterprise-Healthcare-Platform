import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ModalityType, StudyStatus } from '@health/db';

export class CreateStudyDto {
  @IsUUID()
  patientId!: string;

  @IsString()
  @MaxLength(128)
  studyUid!: string;

  @IsString()
  @MaxLength(32)
  accessionNumber!: string;

  @IsEnum(ModalityType)
  modality!: ModalityType;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  bodyPart?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  referringDoctor?: string;

  @IsOptional()
  @IsUUID()
  pacsNodeId?: string;
}

export class UpdateStudyDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  bodyPart?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  referringDoctor?: string;

  @IsOptional()
  @IsUUID()
  pacsNodeId?: string;
}

export class ScheduleStudyDto {
  @IsDateString()
  scheduledAt!: string;
}

export class ListStudiesQueryDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsEnum(StudyStatus)
  status?: StudyStatus;

  @IsOptional()
  @IsEnum(ModalityType)
  modality?: ModalityType;
}
