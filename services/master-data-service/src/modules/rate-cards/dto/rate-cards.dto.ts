import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsDateString,
  MaxLength,
} from '@health/validation';

export class CreateRateCardDto {
  @IsString()
  @MaxLength(32)
  code!: string;

  @IsString()
  @MaxLength(128)
  name!: string;

  @IsString()
  @MaxLength(32)
  cardType!: string;

  @IsString()
  @MaxLength(32)
  clientType!: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  pricingRules?: unknown[];

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}

export class UpdateRateCardDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  cardType?: string;

  @IsOptional()
  @IsString()
  clientType?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  pricingRules?: unknown[];

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
