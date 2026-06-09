import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '@health/validation';

export class ListLakeObjectsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sourceEvent?: string;
}

export class IngestLakeDto {
  @IsString()
  @MaxLength(128)
  sourceTopic!: string;

  @IsString()
  @MaxLength(64)
  sourceEvent!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  format?: string;
}
