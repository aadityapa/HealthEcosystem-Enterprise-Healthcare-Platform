import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePolicyDto {
  @IsString()
  @MaxLength(32)
  policyCode!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(64)
  category!: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsDateString()
  effectiveFrom!: string;

  @IsOptional()
  @IsDateString()
  reviewDueAt?: string;
}

export class UpdatePolicyDto {
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
  content?: string;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  reviewDueAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}
