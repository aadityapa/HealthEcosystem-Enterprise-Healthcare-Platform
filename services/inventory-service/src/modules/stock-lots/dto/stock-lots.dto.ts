import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNotEmpty,
  MaxLength,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LotStatus } from '@health/db';
import { PaginationDto } from '@health/validation';
import { Type } from 'class-transformer';

export class CreateStockLotDto {
  @ApiProperty()
  @IsUUID()
  itemId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  lotNumber!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  batchNumber?: string;

  @ApiProperty()
  @Type(() => Number)
  @Min(0.01)
  quantity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  unitCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  manufacturedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  location?: string;
}

export class UpdateStockLotDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  availableQty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  location?: string;

  @ApiPropertyOptional({ enum: LotStatus })
  @IsOptional()
  @IsEnum(LotStatus)
  status?: LotStatus;
}

export class ListStockLotsDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  itemId?: string;

  @ApiPropertyOptional({ enum: LotStatus })
  @IsOptional()
  @IsEnum(LotStatus)
  status?: LotStatus;
}

export class ExpiringLotsDto {
  @ApiPropertyOptional({ default: 30, description: 'Days until expiry' })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  days?: number;
}
