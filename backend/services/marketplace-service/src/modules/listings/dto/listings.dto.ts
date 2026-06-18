import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateListingDto {
  @IsOptional()
  @IsUUID()
  partnerLabId?: string;

  @IsString()
  @MaxLength(32)
  listingType!: string;

  @IsString()
  @MaxLength(64)
  itemCode!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  price!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  mrp?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  mrp?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ListListingsQueryDto {
  @IsOptional()
  @IsString()
  listingType?: string;

  @IsOptional()
  @IsUUID()
  partnerLabId?: string;
}
