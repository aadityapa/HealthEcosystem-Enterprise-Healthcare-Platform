import { IsOptional, IsString, IsUUID } from '@health/validation';

export class GenerateReportDto {
  @IsOptional()
  @IsUUID()
  templateId?: string;
}

export class ReleaseReportDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ListReportsQueryDto {
  @IsOptional()
  @IsUUID()
  labOrderId?: string;

  @IsOptional()
  @IsUUID()
  sampleId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
