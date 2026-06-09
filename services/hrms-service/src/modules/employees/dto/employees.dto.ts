import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentStatus } from '@health/db';

export class CreateEmployeeDto {
  @IsString()
  @MaxLength(32)
  employeeCode!: string;

  @IsString()
  @MaxLength(128)
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  designation?: string;

  @IsDateString()
  joinDate!: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  salary?: number;
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  designation?: string;

  @IsOptional()
  @IsEnum(EmploymentStatus)
  status?: EmploymentStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  salary?: number;
}

export class ListEmployeesQueryDto {
  @IsOptional()
  @IsEnum(EmploymentStatus)
  status?: EmploymentStatus;

  @IsOptional()
  @IsString()
  department?: string;
}
