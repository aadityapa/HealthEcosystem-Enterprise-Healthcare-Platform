import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '@health/validation';

export class ListWarehouseTablesQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  schemaName?: string;
}

export class RefreshWarehouseDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  tableName?: string;
}
