import { IsOptional, IsString, IsUUID } from '@health/validation';

export class CollectSampleDto {
  @IsOptional()
  @IsUUID()
  collectedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  storageLocation?: string;
}

export class ReceiveSampleDto {
  @IsOptional()
  @IsUUID()
  processingBranchId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  storageLocation?: string;
}

export class ProcessSampleDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectSampleDto {
  @IsString()
  reason!: string;
}

export class ListSamplesQueryDto {
  @IsOptional()
  @IsUUID()
  labOrderId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
