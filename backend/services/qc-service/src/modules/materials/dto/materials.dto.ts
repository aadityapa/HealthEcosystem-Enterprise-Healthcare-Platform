import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQcMaterialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  analyte!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  level!: string;

  @Type(() => Number)
  @IsNumber()
  targetMean!: number;

  @Type(() => Number)
  @IsNumber()
  targetSd!: number;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  lotNumber?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateQcMaterialDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  targetMean?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  targetSd?: number;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  lotNumber?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListMaterialsQueryDto {
  @IsOptional()
  @IsString()
  analyte?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
