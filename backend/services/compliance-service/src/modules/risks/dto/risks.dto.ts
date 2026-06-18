import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateRiskDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(64)
  category!: string;

  @IsString()
  @MaxLength(16)
  likelihood!: string;

  @IsString()
  @MaxLength(16)
  impact!: string;

  @IsInt()
  @Min(1)
  @Max(25)
  riskScore!: number;

  @IsOptional()
  @IsString()
  mitigation?: string;

  @IsOptional()
  @IsUUID()
  owner?: string;
}

export class UpdateRiskDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  likelihood?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  impact?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(25)
  riskScore?: number;

  @IsOptional()
  @IsString()
  mitigation?: string;

  @IsOptional()
  @IsUUID()
  owner?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}
