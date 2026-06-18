import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class DicomStoreDto {
  @IsString()
  @IsNotEmpty()
  data!: string;

  @IsOptional()
  @IsUUID()
  studyId?: string;

  @IsOptional()
  @IsString()
  storagePath?: string;
}

export class ListInstancesQueryDto {
  @IsOptional()
  @IsUUID()
  seriesId?: string;

  @IsOptional()
  @IsUUID()
  studyId?: string;
}
