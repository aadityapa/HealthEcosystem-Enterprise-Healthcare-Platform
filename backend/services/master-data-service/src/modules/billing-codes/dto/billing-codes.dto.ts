import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  Min,
  MaxLength,
} from '@health/validation';

export class CreateBillingCodeDto {
  @IsString()
  @MaxLength(32)
  code!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MaxLength(32)
  codeType!: string;

  @IsOptional()
  @IsUUID()
  taxMasterId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultPrice?: number;
}

export class UpdateBillingCodeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  codeType?: string;

  @IsOptional()
  @IsUUID()
  taxMasterId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultPrice?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
