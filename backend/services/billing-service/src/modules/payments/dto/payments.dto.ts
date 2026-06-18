import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@health/db';

export class CollectPaymentDto {
  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ enum: ['RAZORPAY', 'CASHFREE', 'PAYU'] })
  @IsOptional()
  @IsString()
  gatewayProvider?: 'RAZORPAY' | 'CASHFREE' | 'PAYU';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gatewayOrderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gatewayPaymentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gatewaySignature?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  upiId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chequeNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankReference?: string;
}

export class ProcessRefundDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
