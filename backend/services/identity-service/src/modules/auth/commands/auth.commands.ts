export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly tenantSlug?: string,
    public readonly deviceId?: string,
    public readonly deviceName?: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}

export class LogoutCommand {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly ipAddress?: string,
  ) {}
}

export class RefreshTokenCommand {
  constructor(
    public readonly refreshToken: string,
    public readonly ipAddress?: string,
  ) {}
}

export class VerifyMfaCommand {
  constructor(
    public readonly mfaToken: string,
    public readonly code: string,
    public readonly ipAddress?: string,
  ) {}
}

export class SetupMfaCommand {
  constructor(public readonly userId: string) {}
}

export class EnableMfaCommand {
  constructor(
    public readonly userId: string,
    public readonly code: string,
  ) {}
}

export class ForgotPasswordCommand {
  constructor(
    public readonly email: string,
    public readonly tenantSlug?: string,
  ) {}
}

export class ResetPasswordCommand {
  constructor(
    public readonly token: string,
    public readonly newPassword: string,
  ) {}
}

export class RevokeAllSessionsCommand {
  constructor(public readonly userId: string) {}
}
