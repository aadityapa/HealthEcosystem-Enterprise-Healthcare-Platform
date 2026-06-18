import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  IsNumber,
  Min,
  MaxLength,
} from '@health/validation';

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

export class ListPackagesQueryDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
