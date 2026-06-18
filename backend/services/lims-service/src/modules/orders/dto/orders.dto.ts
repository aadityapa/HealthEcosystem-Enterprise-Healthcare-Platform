import {
  IsUUID,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsNumber,
} from '@health/validation';
import { Type } from '@health/validation';
import type { OrderPriority, OrderSource } from '@health/shared-types';

export class OrderItemDto {
  @IsOptional()
  @IsUUID()
  testId?: string;

  @IsOptional()
  @IsUUID()
  packageId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class CreateLabOrderDto {
  @IsUUID()
  patientId!: string;

  @IsOptional()
  @IsString()
  orderSource?: OrderSource;

  @IsOptional()
  @IsString()
  priority?: OrderPriority;

  @IsOptional()
  @IsUUID()
  orderedBy?: string;

  @IsOptional()
  @IsString()
  referringDoctor?: string;

  @IsOptional()
  @IsString()
  clinicalNotes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}

export class CancelOrderDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ListOrdersQueryDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
