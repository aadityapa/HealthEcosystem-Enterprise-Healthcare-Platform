import { CapaStatus } from '@health/db';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCapaDto {
  @IsUUID()
  failureId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  capaNumber?: string;

  @IsOptional()
  @IsString()
  rootCause?: string;

  @IsOptional()
  @IsString()
  correctiveAction?: string;

  @IsOptional()
  @IsString()
  preventiveAction?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateCapaDto {
  @IsOptional()
  @IsEnum(CapaStatus)
  status?: CapaStatus;

  @IsOptional()
  @IsString()
  rootCause?: string;

  @IsOptional()
  @IsString()
  correctiveAction?: string;

  @IsOptional()
  @IsString()
  preventiveAction?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class ListCapaQueryDto {
  @IsOptional()
  @IsEnum(CapaStatus)
  status?: CapaStatus;
}
