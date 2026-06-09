import {
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractDto {
  @IsString()
  @MaxLength(32)
  partnerType!: string;

  @IsString()
  @MaxLength(255)
  partnerName!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value!: number;

  @IsOptional()
  @IsObject()
  terms?: Record<string, unknown>;
}

export class UpdateContractDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  partnerName?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  @IsOptional()
  @IsObject()
  terms?: Record<string, unknown>;
}
