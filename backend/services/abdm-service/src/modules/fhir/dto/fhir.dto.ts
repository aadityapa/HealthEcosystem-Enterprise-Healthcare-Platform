import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { FhirResourceType } from '@health/db';

export class CreateFhirResourceDto {
  @ApiProperty({ enum: FhirResourceType })
  @IsEnum(FhirResourceType)
  resourceType!: FhirResourceType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  resourceId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiProperty()
  @IsObject()
  content!: Record<string, unknown>;
}

export class ListFhirQueryDto {
  @ApiPropertyOptional({ enum: FhirResourceType })
  @IsOptional()
  @IsEnum(FhirResourceType)
  resourceType?: FhirResourceType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string;
}

export class FhirBundleDto {
  @ApiProperty()
  @IsObject()
  bundle!: Record<string, unknown>;
}
