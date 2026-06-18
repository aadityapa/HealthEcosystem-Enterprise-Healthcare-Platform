import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class OtelSpanDto {
  @IsString()
  @MaxLength(64)
  traceId!: string;

  @IsString()
  @MaxLength(32)
  spanId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  parentSpanId?: string;

  @IsString()
  @MaxLength(64)
  serviceName!: string;

  @IsString()
  @MaxLength(128)
  operationName!: string;

  @IsInt()
  @Min(0)
  durationMs!: number;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;

  @IsString()
  startedAt!: string;
}

export class IngestSpansDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OtelSpanDto)
  spans!: OtelSpanDto[];
}
