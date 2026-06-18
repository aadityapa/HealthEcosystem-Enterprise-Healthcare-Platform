import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateEvidenceDto {
  @IsUUID()
  controlId!: string;

  @IsString()
  @MaxLength(32)
  evidenceType!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  storageKey?: string;
}

export class UpdateEvidenceDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  evidenceType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  storageKey?: string;
}
