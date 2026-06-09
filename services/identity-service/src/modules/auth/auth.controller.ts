import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  LoginDto,
  RefreshTokenDto,
  MfaVerifyDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import {
  LoginCommand,
  LogoutCommand,
  RefreshTokenCommand,
  VerifyMfaCommand,
  SetupMfaCommand,
  EnableMfaCommand,
  ForgotPasswordCommand,
  ResetPasswordCommand,
} from './commands/auth.commands';
import { GetUserProfileQuery } from './queries/auth.queries';
import { JwtAuthGuard } from '@/common/guards/auth.guards';
import { CurrentUser, RequestMeta } from '@/common/decorators/auth.decorators';
import type { JwtPayload } from '@health/shared-types';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user' })
  async login(@Body() dto: LoginDto, @RequestMeta() meta: { ipAddress?: string; userAgent?: string }) {
    const data = await this.commandBus.execute(
      new LoginCommand(dto.email, dto.password, dto.tenantSlug, dto.deviceId, dto.deviceName, meta.ipAddress, meta.userAgent),
    );
    return { success: true, data };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke session' })
  async logout(@CurrentUser() user: JwtPayload, @RequestMeta() meta: { ipAddress?: string }) {
    await this.commandBus.execute(new LogoutCommand(user.sessionId, user.sub, meta.ipAddress));
    return { success: true, data: { message: 'Logged out successfully' } };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const data = await this.commandBus.execute(new RefreshTokenCommand(dto.refreshToken));
    return { success: true, data };
  }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify MFA code' })
  async verifyMfa(@Body() dto: MfaVerifyDto, @RequestMeta() meta: { ipAddress?: string }) {
    const data = await this.commandBus.execute(
      new VerifyMfaCommand(dto.mfaToken, dto.code, meta.ipAddress),
    );
    return { success: true, data };
  }

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup MFA for user' })
  async setupMfa(@CurrentUser() user: JwtPayload) {
    const data = await this.commandBus.execute(new SetupMfaCommand(user.sub));
    return { success: true, data };
  }

  @Post('mfa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable MFA after verification' })
  async enableMfa(@CurrentUser() user: JwtPayload, @Body() dto: MfaVerifyDto) {
    await this.commandBus.execute(new EnableMfaCommand(user.sub, dto.code));
    return { success: true, data: { message: 'MFA enabled successfully' } };
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.commandBus.execute(new ForgotPasswordCommand(dto.email, dto.tenantSlug));
    return { success: true, data: { message: 'If the email exists, a reset link has been sent' } };
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.commandBus.execute(new ResetPasswordCommand(dto.token, dto.newPassword));
    return { success: true, data: { message: 'Password reset successfully' } };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@CurrentUser() user: JwtPayload) {
    const data = await this.queryBus.execute(new GetUserProfileQuery(user.sub));
    return { success: true, data };
  }

  @Get('health')
  health() {
    return { success: true, data: { status: 'ok', service: 'identity-service' } };
  }
}
