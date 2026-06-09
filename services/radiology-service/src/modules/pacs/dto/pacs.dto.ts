import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePacsNodeDto {
  @IsString()
  @MaxLength(128)
  name!: string;

  @IsString()
  @MaxLength(16)
  aeTitle!: string;

  @IsString()
  @MaxLength(255)
  host!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  port?: number;
}

export class UpdatePacsNodeDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  host?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  port?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
