import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVulnerabilityScanDto {
  @IsString()
  @MaxLength(32)
  scanType!: string;

  @IsString()
  @MaxLength(255)
  target!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFindingDto)
  findings?: CreateFindingDto[];
}

export class UpdateVulnerabilityScanDto {
  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  @IsOptional()
  @IsString()
  reportUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  findingsCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  criticalCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  highCount?: number;
}

export class CreateFindingDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  cveId?: string;

  @IsString()
  @MaxLength(16)
  severity!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  remediation?: string;
}
