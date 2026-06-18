import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { AgentType, type AgentTypeValue } from '@/common/agent-type';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAgentDto {
  @ApiProperty({ enum: Object.values(AgentType) })
  @IsIn(Object.values(AgentType))
  agentType!: AgentTypeValue;

  @ApiProperty()
  @IsString()
  @MaxLength(128)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  capabilities?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  modelKey?: string;
}

export class UpdateAgentDto extends PartialType(CreateAgentDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AgentChatDto {
  @ApiProperty()
  @IsString()
  message!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}
