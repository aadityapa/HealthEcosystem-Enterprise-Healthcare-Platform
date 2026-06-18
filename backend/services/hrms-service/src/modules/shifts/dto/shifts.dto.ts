import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateShiftDto {
  @IsString()
  @MaxLength(64)
  name!: string;

  @IsString()
  @MaxLength(8)
  startTime!: string;

  @IsString()
  @MaxLength(8)
  endTime!: string;
}

export class UpdateShiftDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  startTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssignShiftDto {
  @IsUUID()
  employeeId!: string;

  @IsUUID()
  shiftId!: string;

  @IsDateString()
  date!: string;
}
