import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@demolab.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Admin@123456' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tenantSlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceName?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class MfaVerifyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mfaToken!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  code!: string;
}

export class MfaSetupResponseDto {
  secret!: string;
  qrCodeUrl!: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tenantSlug?: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class AuthTokensResponseDto {
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: number;
  mfaRequired?: boolean;
  mfaToken?: string;
}

export class UserProfileDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName?: string;
  tenantId!: string;
  organizationId?: string;
  roles!: string[];
  permissions!: string[];
  branchIds!: string[];
  mfaEnabled!: boolean;
}
