import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from '@health/validation';
import { IsObject } from 'class-validator';
import { Type } from '@health/validation';
import {
  ConnectionType,
  DeviceProtocol,
  DeviceStatus,
  DeviceVendor,
} from '@health/db';

export class RegisterDeviceDto {
  @IsString()
  @MaxLength(64)
  deviceCode!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEnum(DeviceVendor)
  vendor!: DeviceVendor;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  serialNumber?: string;

  @IsEnum(DeviceProtocol)
  protocol!: DeviceProtocol;

  @IsEnum(ConnectionType)
  connectionType!: ConnectionType;

  @IsOptional()
  @IsObject()
  connectionConfig?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @IsOptional()
  @IsString()
  softwareVersion?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  serialNumber?: string;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  connectionConfig?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @IsOptional()
  @IsString()
  softwareVersion?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ConfigureDeviceDto {
  @IsOptional()
  @IsObject()
  connectionConfig?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(DeviceProtocol)
  protocol?: DeviceProtocol;

  @IsOptional()
  @IsEnum(ConnectionType)
  connectionType?: ConnectionType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ListDevicesQueryDto {
  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsOptional()
  @IsEnum(DeviceVendor)
  vendor?: DeviceVendor;

  @IsOptional()
  @IsEnum(DeviceProtocol)
  protocol?: DeviceProtocol;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

export class ConnectionConfigDto {
  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  port?: number;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class CreateConnectionDto extends ConnectionConfigDto {
  @IsEnum(DeviceProtocol)
  protocol!: DeviceProtocol;

  @IsEnum(ConnectionType)
  connectionType!: ConnectionType;
}
