import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  LoginCommand,
  LogoutCommand,
  RefreshTokenCommand,
  VerifyMfaCommand,
  SetupMfaCommand,
  EnableMfaCommand,
  ForgotPasswordCommand,
  ResetPasswordCommand,
} from '../commands/auth.commands';
import { GetUserProfileQuery } from '../queries/auth.queries';
import { AuthService } from '../auth.service';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(private readonly authService: AuthService) {}
  execute(command: LoginCommand) {
    return this.authService.login(command.email, command.password, command.tenantSlug, {
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
      deviceId: command.deviceId,
      deviceName: command.deviceName,
    });
  }
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(private readonly authService: AuthService) {}
  execute(command: LogoutCommand) {
    return this.authService.logout(command.sessionId, command.userId);
  }
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(private readonly authService: AuthService) {}
  execute(command: RefreshTokenCommand) {
    return this.authService.refresh(command.refreshToken);
  }
}

@CommandHandler(VerifyMfaCommand)
export class VerifyMfaHandler implements ICommandHandler<VerifyMfaCommand> {
  constructor(private readonly authService: AuthService) {}
  execute(command: VerifyMfaCommand) {
    return this.authService.verifyMfa(command.mfaToken, command.code, {
      ipAddress: command.ipAddress,
    });
  }
}

@CommandHandler(SetupMfaCommand)
export class SetupMfaHandler implements ICommandHandler<SetupMfaCommand> {
  constructor(private readonly authService: AuthService) {}
  execute(command: SetupMfaCommand) {
    return this.authService.setupMfa(command.userId);
  }
}

@CommandHandler(EnableMfaCommand)
export class EnableMfaHandler implements ICommandHandler<EnableMfaCommand> {
  constructor(private readonly authService: AuthService) {}
  execute(command: EnableMfaCommand) {
    return this.authService.enableMfa(command.userId, command.code);
  }
}

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
  constructor(private readonly authService: AuthService) {}
  execute(command: ForgotPasswordCommand) {
    return this.authService.forgotPassword(command.email, command.tenantSlug);
  }
}

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(private readonly authService: AuthService) {}
  execute(command: ResetPasswordCommand) {
    return this.authService.resetPassword(command.token, command.newPassword);
  }
}

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler implements IQueryHandler<GetUserProfileQuery> {
  constructor(private readonly authService: AuthService) {}
  execute(query: GetUserProfileQuery) {
    return this.authService.getProfile(query.userId);
  }
}
