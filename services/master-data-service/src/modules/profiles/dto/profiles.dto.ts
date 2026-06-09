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

export class CreateProfileDto {
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
  profilePrice!: number;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  testIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  packageIds?: string[];
}

export class UpdateProfileDto {
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
  profilePrice?: number;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  testIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  packageIds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
