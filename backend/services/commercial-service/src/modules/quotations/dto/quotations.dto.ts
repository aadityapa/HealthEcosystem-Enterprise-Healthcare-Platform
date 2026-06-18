import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuotationDto {
  @IsString()
  @MaxLength(255)
  prospectName!: string;

  @IsOptional()
  @IsEmail()
  prospectEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  planCode?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsDateString()
  validUntil!: string;

  @IsOptional()
  @IsArray()
  lineItems?: unknown[];
}

export class UpdateQuotationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  prospectName?: string;

  @IsOptional()
  @IsEmail()
  prospectEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  planCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  @IsOptional()
  @IsArray()
  lineItems?: unknown[];
}
