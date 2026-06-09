import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  brandName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  faviconUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(16)
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(16)
  secondaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customDomain?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  themeConfig?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  mobileAppConfig?: Record<string, unknown>;
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
