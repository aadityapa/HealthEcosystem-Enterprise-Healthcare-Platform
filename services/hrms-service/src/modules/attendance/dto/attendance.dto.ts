import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CheckInDto {
  @IsUUID()
  employeeId!: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CheckOutDto {
  @IsUUID()
  employeeId!: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
