import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCertificationDto {
  @IsUUID()
  employeeId!: string;

  @IsString()
  @MaxLength(255)
  certName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  issuingBody?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  certNumber?: string;

  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class ListCertificationsQueryDto {
  @IsOptional()
  @IsUUID()
  employeeId?: string;
}
