import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFeatureDto {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  featureKey!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {}
