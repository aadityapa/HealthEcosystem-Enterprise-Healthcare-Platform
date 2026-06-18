import { IsBoolean, IsEnum, IsOptional, IsString } from '@health/validation';
import { IsObject } from 'class-validator';
import { DeviceVendor } from '@health/db';

export class CreateAdapterConfigDto {
  @IsString()
  deviceId!: string;

  @IsEnum(DeviceVendor)
  vendor!: DeviceVendor;

  @IsOptional()
  @IsString()
  adapterVersion?: string;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @IsOptional()
  @IsObject()
  transformationRules?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  validationRules?: Record<string, unknown>;
}

export class UpdateAdapterConfigDto {
  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @IsOptional()
  @IsObject()
  transformationRules?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  validationRules?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
