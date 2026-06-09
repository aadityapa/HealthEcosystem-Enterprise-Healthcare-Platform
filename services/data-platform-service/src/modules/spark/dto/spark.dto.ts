import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitSparkJobDto {
  @IsString()
  @MaxLength(128)
  jobName!: string;

  @IsString()
  @MaxLength(512)
  mainClass!: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  inputPath?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  outputPath?: string;

  @IsOptional()
  @IsObject()
  args?: Record<string, unknown>;
}
