import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWellnessPackageDto {
  @IsString()
  @MaxLength(32)
  code!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  testIds?: string[];

  @Type(() => Number)
  @IsNumber()
  price!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  corporatePrice?: number;
}

export class UpdateWellnessPackageDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  testIds?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  corporatePrice?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
