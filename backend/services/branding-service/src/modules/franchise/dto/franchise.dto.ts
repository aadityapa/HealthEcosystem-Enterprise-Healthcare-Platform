import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString, IsUrl, IsUUID, MaxLength } from 'class-validator';

export class CreateFranchiseBrandDto {
  @ApiProperty()
  @IsUUID()
  branchId!: string;

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
  @IsObject()
  themeConfig?: Record<string, unknown>;
}

export class UpdateFranchiseBrandDto extends PartialType(CreateFranchiseBrandDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
