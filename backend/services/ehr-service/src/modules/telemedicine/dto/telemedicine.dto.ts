import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { TeleconsultStatus } from '@health/db';

export class ScheduleTeleconsultDto {
  @ApiProperty()
  @IsUUID()
  patientId!: string;

  @ApiProperty()
  @IsUUID()
  doctorId!: string;

  @ApiProperty()
  @IsDateString()
  scheduledAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  meetingUrl?: string;
}

export class ListTeleconsultQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ enum: TeleconsultStatus })
  @IsOptional()
  @IsString()
  status?: TeleconsultStatus;
}

export class EndTeleconsultDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recordingUrl?: string;
}
