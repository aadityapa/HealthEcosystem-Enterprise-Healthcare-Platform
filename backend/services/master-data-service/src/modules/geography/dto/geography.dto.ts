import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  MaxLength,
} from '@health/validation';

export class CreateStateDto {
  @IsString()
  @MaxLength(4)
  code!: string;

  @IsString()
  @MaxLength(128)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  gstCode?: string;
}

export class UpdateStateDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  gstCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCityDto {
  @IsUUID()
  stateId!: string;

  @IsString()
  @MaxLength(16)
  code!: string;

  @IsString()
  @MaxLength(128)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  pincode?: string;
}

export class UpdateCityDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListCitiesQueryDto {
  @IsOptional()
  @IsUUID()
  stateId?: string;
}
