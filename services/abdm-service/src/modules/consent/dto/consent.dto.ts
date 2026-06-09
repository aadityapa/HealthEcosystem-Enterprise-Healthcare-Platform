import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class RequestConsentDto {
  @ApiProperty()
  @IsUUID()
  patientId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(17)
  abhaNumber!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  purpose!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  hiTypes!: string[];

  @ApiProperty()
  @IsDateString()
  dateFrom!: string;

  @ApiProperty()
  @IsDateString()
  dateTo!: string;
}

export class GrantConsentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  artefactId?: string;
}

export class RevokeConsentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ListConsentQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string;
}
