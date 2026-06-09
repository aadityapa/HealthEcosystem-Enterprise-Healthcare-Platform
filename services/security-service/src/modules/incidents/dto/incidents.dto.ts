import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { IncidentSeverity, IncidentStatus } from '@health/db';

export class CreateIncidentDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  threatType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(45)
  sourceIp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  affectedService?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}

export class UpdateIncidentDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  threatType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(45)
  sourceIp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  affectedService?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
