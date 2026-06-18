import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SignDocumentDto {
  @IsString()
  @MaxLength(255)
  signedByName!: string;

  @IsString()
  @MaxLength(32)
  signatureType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string;
}
