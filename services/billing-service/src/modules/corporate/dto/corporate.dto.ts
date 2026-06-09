import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCorporateClientDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  legalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @IsInt()
  @Min(0)
  paymentTermsDays?: number;
}

export class CreateCorporateContractDto {
  @ApiProperty()
  @IsUUID()
  corporateClientId!: string;

  @ApiProperty()
  @IsString()
  contractNumber!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  rateCardId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiProperty()
  @IsString()
  effectiveFrom!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  effectiveTo?: string;
}

export class UpsertCreditLimitDto {
  @ApiProperty()
  @IsUUID()
  corporateClientId!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  creditLimit!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  alertThreshold?: number;
}

export class GenerateStatementDto {
  @ApiProperty()
  @IsUUID()
  corporateClientId!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  periodMonth!: number;

  @ApiProperty()
  @IsInt()
  @Min(2000)
  periodYear!: number;
}

export class UpdateCorporateClientDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
