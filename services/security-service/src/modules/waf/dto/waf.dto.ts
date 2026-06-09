import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class BlockIpDto {
  @IsString()
  @MaxLength(45)
  ip!: string;

  @IsString()
  @MaxLength(255)
  reason!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  ttlMinutes?: number;
}
