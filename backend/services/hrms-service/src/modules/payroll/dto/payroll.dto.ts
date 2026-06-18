import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreatePayrollRunDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  runNumber?: string;

  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth!: number;

  @IsInt()
  @Min(2000)
  periodYear!: number;
}
