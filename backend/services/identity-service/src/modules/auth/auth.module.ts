import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import {
  LoginHandler,
  LogoutHandler,
  RefreshTokenHandler,
  VerifyMfaHandler,
  SetupMfaHandler,
  EnableMfaHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
  GetUserProfileHandler,
} from './handlers/auth.handlers';

const CommandHandlers = [
  LoginHandler,
  LogoutHandler,
  RefreshTokenHandler,
  VerifyMfaHandler,
  SetupMfaHandler,
  EnableMfaHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
];

const QueryHandlers = [GetUserProfileHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'change-me-in-production'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRY', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ...CommandHandlers, ...QueryHandlers],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
