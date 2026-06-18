import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMigrationJobDto {
  @IsString()
  @MaxLength(32)
  importType!: string;
}

export class ListMigrationJobsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}
