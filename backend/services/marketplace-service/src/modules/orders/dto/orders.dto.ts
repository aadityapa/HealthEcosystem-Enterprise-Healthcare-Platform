import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BookTestOrderDto {
  @IsUUID()
  partnerLabId!: string;

  @IsUUID()
  patientId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  orderNumber?: string;

  @Type(() => Number)
  @IsNumber()
  totalAmount!: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class B2BOrderDto {
  @IsUUID()
  partnerLabId!: string;

  @IsUUID()
  corporateId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  orderNumber?: string;

  @Type(() => Number)
  @IsNumber()
  totalAmount!: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ListOrdersQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  partnerLabId?: string;
}
