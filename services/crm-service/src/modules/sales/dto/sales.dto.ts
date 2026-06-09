import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateSalesTargetDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;

  @ApiProperty({ example: 6, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth!: number;

  @ApiProperty({ example: 2025 })
  @IsInt()
  @Min(2000)
  periodYear!: number;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  @Min(0)
  targetAmount!: number;
}

export class UpdateSalesTargetDto extends PartialType(CreateSalesTargetDto) {
  @ApiPropertyOptional({ example: 75000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  achievedAmount?: number;
}

export class DashboardQueryDto {
  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth?: number;

  @ApiPropertyOptional({ example: 2025 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  periodYear?: number;
}
