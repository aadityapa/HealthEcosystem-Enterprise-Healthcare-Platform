import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class LegalHoldDto {
  @IsUUID()
  documentId!: string;

  @IsBoolean()
  legalHold!: boolean;
}

export class ExpiringQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  withinDays?: number;
}
