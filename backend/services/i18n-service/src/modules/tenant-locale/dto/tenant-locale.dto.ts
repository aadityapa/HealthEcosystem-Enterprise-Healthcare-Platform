import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTenantLocaleDto {
  @ApiProperty()
  @IsString()
  @MaxLength(3)
  countryCode!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(3)
  currency!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(16)
  locale!: string;

  @ApiPropertyOptional({ default: 'Asia/Kolkata' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @ApiPropertyOptional({ default: 'DD/MM/YYYY' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  dateFormat?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateTenantLocaleDto extends PartialType(CreateTenantLocaleDto) {}
