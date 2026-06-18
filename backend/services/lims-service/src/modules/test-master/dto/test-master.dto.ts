import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsUUID,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  MaxLength,
} from '@health/validation';

export class CreateTestCategoryDto {
  @IsString()
  @MaxLength(32)
  code!: string;

  @IsString()
  @MaxLength(128)
  name!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateTestCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateTestDto {
  @IsUUID()
  categoryId!: string;

  @IsString()
  @MaxLength(32)
  code!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  shortName?: string;

  @IsString()
  @MaxLength(32)
  specimenType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  containerType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  tatHours?: number;

  @IsOptional()
  methodology?: Record<string, unknown>;

  @IsOptional()
  referenceRanges?: unknown[];
}

export class UpdateTestDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  shortName?: string;

  @IsOptional()
  @IsString()
  specimenType?: string;

  @IsOptional()
  @IsString()
  containerType?: string;

  @IsOptional()
  @IsInt()
  tatHours?: number;

  @IsOptional()
  methodology?: Record<string, unknown>;

  @IsOptional()
  referenceRanges?: unknown[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateTestParameterDto {
  @IsString()
  @MaxLength(32)
  code!: string;

  @IsString()
  @MaxLength(128)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string;

  @IsOptional()
  @IsString()
  dataType?: string;

  @IsOptional()
  @IsInt()
  decimalPlaces?: number;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CreatePackageDto {
  @IsString()
  @MaxLength(32)
  code!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  packagePrice!: number;

  @IsArray()
  @IsUUID(undefined, { each: true })
  testIds!: string[];
}

export class UpdatePackageDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packagePrice?: number;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  testIds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreatePricingDto {
  @IsUUID()
  testId!: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mrp?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  corporatePrice?: number;
}

export class UpdatePricingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mrp?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  corporatePrice?: number;
}

export class ListTestsQueryDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListPricingQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  testId?: string;
}
