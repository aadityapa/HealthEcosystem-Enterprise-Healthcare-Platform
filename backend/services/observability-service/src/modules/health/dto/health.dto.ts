import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '@health/validation';

export class ListHealthSnapshotsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  serviceName?: string;
}
