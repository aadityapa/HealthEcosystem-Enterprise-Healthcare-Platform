import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { TicketStatus } from '@health/db';

export class CreateTicketDto {
  @IsString()
  @MaxLength(255)
  subject!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  priority?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  priority?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
