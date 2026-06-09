import { IsBoolean, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  @MaxLength(255)
  domain!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  issuer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  serialNumber?: string;

  @IsDateString()
  validFrom!: string;

  @IsDateString()
  validTo!: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;
}

export class UpdateCertificateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  domain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  issuer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  serialNumber?: string;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}
