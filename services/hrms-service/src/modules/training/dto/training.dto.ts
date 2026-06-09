import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTrainingDto {
  @IsUUID()
  employeeId!: string;

  @IsString()
  @MaxLength(255)
  trainingName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  provider?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsDateString()
  expiryAt?: string;

  @IsOptional()
  @IsString()
  certificateUrl?: string;
}

export class ListTrainingQueryDto {
  @IsOptional()
  @IsUUID()
  employeeId?: string;
}
