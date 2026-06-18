import { IsString, IsOptional, IsBoolean, MaxLength } from '@health/validation';

export class CreateDepartmentDto {
  @IsString()
  @MaxLength(32)
  code!: string;

  @IsString()
  @MaxLength(128)
  name!: string;

  @IsString()
  @MaxLength(32)
  departmentType!: string;
}

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  departmentType?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
