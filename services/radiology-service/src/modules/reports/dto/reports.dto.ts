import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @MaxLength(32)
  reportNumber!: string;

  @IsOptional()
  @IsString()
  findings?: string;

  @IsOptional()
  @IsString()
  impression?: string;
}

export class VerifyReportDto {
  @IsOptional()
  @IsString()
  findings?: string;

  @IsOptional()
  @IsString()
  impression?: string;
}

export class ReleaseReportDto {
  @IsString()
  @IsNotEmpty()
  pdfS3Key!: string;
}
