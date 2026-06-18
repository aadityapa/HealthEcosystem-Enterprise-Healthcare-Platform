import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRevenueShareRuleDto {
  @ApiProperty()
  @IsUUID()
  franchiseBranchId!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  revenueSharePct!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  royaltyPct?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionPct?: number;

  @ApiProperty()
  @IsDateString()
  effectiveFrom!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}

export class CalculateSettlementDto {
  @ApiProperty()
  @IsUUID()
  franchiseBranchId!: string;

  @ApiProperty()
  @IsUUID()
  parentBranchId!: string;

  @ApiProperty()
  @IsDateString()
  periodStart!: string;

  @ApiProperty()
  @IsDateString()
  periodEnd!: string;
}

export class ListSettlementsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  franchiseBranchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
