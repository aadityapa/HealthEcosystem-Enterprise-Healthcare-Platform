import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RotateSecretDto {
  @IsString()
  @MaxLength(128)
  secretName!: string;

  @IsString()
  @MaxLength(32)
  rotationType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}
