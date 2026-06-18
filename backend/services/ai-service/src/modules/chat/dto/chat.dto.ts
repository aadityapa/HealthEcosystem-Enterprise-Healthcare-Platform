import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateChatSessionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({ example: 'web' })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class SendChatMessageDto {
  @ApiProperty({ example: 'When will my report be ready?' })
  @IsString()
  content!: string;
}
