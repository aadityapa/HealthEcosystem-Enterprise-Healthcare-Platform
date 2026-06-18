import { IsString, IsOptional, IsBoolean, MaxLength } from '@health/validation';

export class CreateDeviceCatalogDto {
  @IsString()
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(32)
  vendor!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  model?: string;

  @IsString()
  @MaxLength(32)
  deviceType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  protocol?: string;
}

export class UpdateDeviceCatalogDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  protocol?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
