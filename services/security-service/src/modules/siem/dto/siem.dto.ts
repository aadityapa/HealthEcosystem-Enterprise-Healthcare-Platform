import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class IngestSiemEventDto {
  @IsString()
  @MaxLength(64)
  eventType!: string;

  @IsString()
  @MaxLength(64)
  source!: string;

  @IsString()
  @MaxLength(16)
  severity!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsObject()
  rawPayload?: Record<string, unknown>;
}

export class IngestSiemBatchDto {
  events!: IngestSiemEventDto[];
}
