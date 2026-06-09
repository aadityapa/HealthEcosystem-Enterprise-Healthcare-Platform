import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  MaxLength,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { Type } from 'class-transformer';
import { TransferStatus } from '@health/db';

export class StockTransferLineDto {
  @ApiProperty()
  @IsUUID()
  itemId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  lotNumber!: string;

  @ApiProperty()
  @Type(() => Number)
  @Min(0.01)
  quantity!: number;
}

export class CreateStockTransferDto {
  @ApiProperty()
  @IsUUID()
  toBranchId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [StockTransferLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockTransferLineDto)
  lines!: StockTransferLineDto[];
}

export class ListStockTransfersDto extends PaginationDto {
  @ApiPropertyOptional({ enum: TransferStatus })
  @IsOptional()
  status?: TransferStatus;
}
