import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
  Min,
  MaxLength,
} from '@health/validation';

export class CreateTaxDto {
  @IsString()
  @MaxLength(32)
  code!: string;

  @IsString()
  @MaxLength(128)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  hsnSacCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cgstRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sgstRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  igstRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cessRate?: number;

  @IsOptional()
  @IsBoolean()
  isExempt?: boolean;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}

export class UpdateTaxDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  hsnSacCode?: string;

  @IsOptional()
  @IsNumber()
  cgstRate?: number;

  @IsOptional()
  @IsNumber()
  sgstRate?: number;

  @IsOptional()
  @IsNumber()
  igstRate?: number;

  @IsOptional()
  @IsNumber()
  cessRate?: number;

  @IsOptional()
  @IsBoolean()
  isExempt?: boolean;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
