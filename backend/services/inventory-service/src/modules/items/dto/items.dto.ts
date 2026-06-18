import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsObject,
  IsNotEmpty,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryItemType } from '@health/db';
import { PaginationDto } from '@health/validation';
import { Type } from 'class-transformer';

export class CreateInventoryItemDto {
  @ApiProperty({ enum: InventoryItemType })
  @IsEnum(InventoryItemType)
  itemType!: InventoryItemType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  sku!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @ApiPropertyOptional({ default: 'unit' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  unit?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  reorderLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  storageTemp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({ enum: InventoryItemType })
  @IsOptional()
  @IsEnum(InventoryItemType)
  itemType?: InventoryItemType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(16)
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  reorderLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  storageTemp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListInventoryItemsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: InventoryItemType })
  @IsOptional()
  @IsEnum(InventoryItemType)
  itemType?: InventoryItemType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
