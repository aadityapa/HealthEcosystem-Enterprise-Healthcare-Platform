import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTranslationKeyDto {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  namespace!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(128)
  key!: string;

  @ApiProperty()
  @IsString()
  defaultValue!: string;
}

export class CreateTranslationDto {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  namespace!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(128)
  key!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(16)
  locale!: string;

  @ApiProperty()
  @IsString()
  value!: string;
}

export class UpdateTranslationDto extends PartialType(CreateTranslationDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultValue?: string;
}
