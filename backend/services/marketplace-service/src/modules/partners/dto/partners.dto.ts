import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePartnerDto {
  @IsString()
  @MaxLength(32)
  code!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  city?: string;

  @IsOptional()
  @IsBoolean()
  nablAccredited?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;
}

export class UpdatePartnerDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  city?: string;

  @IsOptional()
  @IsBoolean()
  nablAccredited?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
