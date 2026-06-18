import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMaterializedViewDto {
  @ApiProperty({ example: 'mv_daily_revenue' })
  @IsString()
  @MaxLength(128)
  viewName!: string;

  @ApiProperty({ example: 'billing' })
  @IsString()
  @MaxLength(32)
  sourceSchema!: string;

  @ApiPropertyOptional({ example: '0 2 * * *' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  refreshCron?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  clickhouseTable?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RefreshMaterializedViewDto {
  @ApiProperty({ example: 'mv_daily_revenue' })
  @IsString()
  @MaxLength(128)
  viewName!: string;
}
