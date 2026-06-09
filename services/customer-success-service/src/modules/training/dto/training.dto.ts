import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class EnrollTrainingDto {
  @IsUUID()
  courseId!: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class UpdateTrainingProgressDto {
  @IsInt()
  @Min(0)
  @Max(100)
  progressPct!: number;
}
