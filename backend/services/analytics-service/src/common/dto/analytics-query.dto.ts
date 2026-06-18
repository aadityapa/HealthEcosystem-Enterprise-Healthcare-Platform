import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '@health/validation';

export class DateRangeQueryDto {
  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2025-06-30' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class TrendQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional({ enum: ['daily', 'monthly'], default: 'daily' })
  @IsOptional()
  @IsEnum(['daily', 'monthly'])
  granularity?: 'daily' | 'monthly' = 'daily';
}

export class BranchFilterQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class TopTestsQueryDto extends TrendQueryDto {
  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class ListDashboardsQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['executive', 'operational', 'clinical', 'financial'])
  dashboardType?: string;
}

export function parseDateRange(query: DateRangeQueryDto): { from: Date; to: Date } {
  const to = query.to ? new Date(query.to) : new Date();
  const from = query.from
    ? new Date(query.from)
    : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from, to };
}

export function toNumber(value: { toNumber?: () => number } | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  return Number(value);
}
