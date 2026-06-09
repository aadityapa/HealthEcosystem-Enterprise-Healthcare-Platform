import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsDateString,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { Type } from 'class-transformer';
import { PoStatus } from '@health/db';

export class PurchaseOrderLineDto {
  @ApiProperty()
  @IsUUID()
  itemId!: string;

  @ApiProperty()
  @Type(() => Number)
  @Min(0.01)
  quantity!: number;

  @ApiProperty()
  @Type(() => Number)
  @Min(0)
  unitPrice!: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty()
  @IsUUID()
  vendorId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [PurchaseOrderLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderLineDto)
  lines!: PurchaseOrderLineDto[];
}

export class ListPurchaseOrdersDto extends PaginationDto {
  @ApiPropertyOptional({ enum: PoStatus })
  @IsOptional()
  status?: PoStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  vendorId?: string;
}

export class ReceivePurchaseOrderLineDto {
  @ApiProperty()
  @Type(() => Number)
  @Min(0.01)
  quantity!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lotNumber!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  unitCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;
}
