import { IsArray, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SiemEventForDetectionDto {
  @IsString()
  eventType!: string;

  @IsString()
  source!: string;

  @IsString()
  severity!: string;

  @IsString()
  message!: string;

  @IsOptional()
  rawPayload?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  sourceIp?: string;
}

export class DetectThreatsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SiemEventForDetectionDto)
  events!: SiemEventForDetectionDto[];
}

export class AcknowledgeThreatDto {
  @IsOptional()
  @IsString()
  note?: string;
}
