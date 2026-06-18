import { IsString, IsOptional, IsBoolean, MaxLength } from '@health/validation';

export class CreateSpecialtyDto {
  @IsString()
  @MaxLength(32)
  code!: string;

  @IsString()
  @MaxLength(128)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSpecialtyDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
