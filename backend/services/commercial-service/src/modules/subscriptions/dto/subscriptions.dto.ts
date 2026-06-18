import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { SubscriptionStatus } from '@health/db';
import { Type } from 'class-transformer';

export class CreateSubscriptionDto {
  @IsUUID()
  planId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  seats?: number;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
}
