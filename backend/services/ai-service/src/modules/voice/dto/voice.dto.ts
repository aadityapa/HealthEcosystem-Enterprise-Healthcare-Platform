import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TranscribeDto {
  @ApiPropertyOptional({ description: 'Base64-encoded audio payload (stub)' })
  @IsOptional()
  @IsString()
  audioBase64?: string;

  @ApiPropertyOptional({ example: 'en-IN' })
  @IsOptional()
  @IsString()
  language?: string;
}

export class VoiceRespondDto {
  @ApiProperty({ example: 'What are your lab hours?' })
  @IsString()
  transcript!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inputRef?: string;
}
