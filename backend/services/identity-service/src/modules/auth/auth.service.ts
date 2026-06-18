import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import { v4 as uuidv4 } from 'uuid';
import type { PrismaClient, User, UserSession } from '@health/db';
import { PRISMA } from '@/database/database.module';
import { REDIS } from '@/redis/redis.module';
import type Redis from 'ioredis';
import type { JwtPayload } from '@health/shared-types';
import { createEvent } from '@health/events';
import { EVENT_TYPES } from '@health/shared-types';
import type { AuthTokensResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly accessExpiry: string;
  private readonly refreshExpiryDays: number;

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    @Inject(REDIS) private readonly redis: Redis,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.accessExpiry = config.get('JWT_ACCESS_EXPIRY', '15m');
    this.refreshExpiryDays = 7;
  }

  async validateUser(email: string, password: string, tenantSlug?: string): Promise<User> {
    const tenant = tenantSlug
      ? await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } })
      : null;

    const user = await this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        ...(tenant ? { tenantId: tenant.id } : {}),
        status: 'ACTIVE',
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        },
        userBranches: true,
      },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async buildTokenPayload(user: User & {
    userRoles: Array<{
      role: {
        code: string;
        rolePermissions: Array<{ permission: { code: string } }>;
      };
      branchId: string | null;
    }>;
    userBranches: Array<{ branchId: string }>;
  }, sessionId: string, mfaVerified = false): Promise<JwtPayload> {
    const roles = [...new Set(user.userRoles.map((ur) => ur.role.code))];
    const permissions = [
      ...new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.code),
        ),
      ),
    ];
    const branchIds = user.userBranches.map((ub) => ub.branchId);

    return {
      sub: user.id,
      tenantId: user.tenantId,
      organizationId: user.organizationId ?? undefined,
      email: user.email,
      roles,
      permissions,
      branchIds,
      mfaVerified,
      sessionId,
    };
  }

  async issueTokens(
    payload: JwtPayload,
    meta: { ipAddress?: string; userAgent?: string; deviceId?: string; deviceName?: string },
  ): Promise<AuthTokensResponseDto> {
    const refreshToken = uuidv4() + '.' + uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshExpiryDays);

    await this.prisma.userSession.create({
      data: {
        tenantId: payload.tenantId,
        userId: payload.sub,
        refreshToken,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        deviceId: meta.deviceId,
        deviceName: meta.deviceName,
        expiresAt,
      },
    });

    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessExpiry,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  async login(
    email: string,
    password: string,
    tenantSlug?: string,
    meta?: { ipAddress?: string; userAgent?: string; deviceId?: string; deviceName?: string },
  ): Promise<AuthTokensResponseDto & { mfaRequired?: boolean; mfaToken?: string }> {
    const user = await this.validateUser(email, password, tenantSlug) as User & {
      userRoles: Array<{
        role: { code: string; rolePermissions: Array<{ permission: { code: string } }> };
        branchId: string | null;
      }>;
      userBranches: Array<{ branchId: string }>;
      mfaEnabled: boolean;
    };

    if (user.mfaEnabled) {
      const mfaToken = uuidv4();
      await this.redis.setex(`mfa:${mfaToken}`, 300, user.id);
      return { accessToken: '', refreshToken: '', expiresIn: 0, mfaRequired: true, mfaToken };
    }

    const sessionId = uuidv4();
    const payload = await this.buildTokenPayload(user, sessionId, false);
    const tokens = await this.issueTokens(payload, meta ?? {});

    await this.redis.setex(
      `session:${sessionId}`,
      900,
      JSON.stringify(payload),
    );

    return tokens;
  }

  async verifyMfa(mfaToken: string, code: string, meta?: { ipAddress?: string; userAgent?: string }) {
    const userId = await this.redis.get(`mfa:${mfaToken}`);
    if (!userId) throw new UnauthorizedException('MFA session expired');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: { include: { rolePermissions: { include: { permission: true } } } },
          },
        },
        userBranches: true,
      },
    });

    if (!user?.mfaSecret) throw new BadRequestException('MFA not configured');

    const valid = authenticator.verify({ token: code, secret: user.mfaSecret });
    if (!valid) throw new UnauthorizedException('Invalid MFA code');

    await this.redis.del(`mfa:${mfaToken}`);

    const sessionId = uuidv4();
    const payload = await this.buildTokenPayload(user, sessionId, true);
    return this.issueTokens(payload, meta ?? {});
  }

  async refresh(refreshToken: string): Promise<AuthTokensResponseDto> {
    const session = await this.prisma.userSession.findUnique({
      where: { refreshToken },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: { include: { rolePermissions: { include: { permission: true } } } },
              },
            },
            userBranches: true,
          },
        },
      },
    });

    if (!session || session.status !== 'ACTIVE' || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const sessionId = uuidv4();
    const payload = await this.buildTokenPayload(session.user, sessionId, true);

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { status: 'REVOKED', revokedAt: new Date() },
    });

    return this.issueTokens(payload, {
      ipAddress: session.ipAddress ?? undefined,
      userAgent: session.userAgent ?? undefined,
      deviceId: session.deviceId ?? undefined,
      deviceName: session.deviceName ?? undefined,
    });
  }

  async logout(sessionId: string, userId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'REVOKED', revokedAt: new Date() },
    });
    await this.redis.del(`session:${sessionId}`);
  }

  async setupMfa(userId: string) {
    const secret = authenticator.generateSecret();
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    await this.redis.setex(`mfa-setup:${userId}`, 600, secret);

    const qrCodeUrl = authenticator.keyuri(user.email, 'HealthEcosystem', secret);
    return { secret, qrCodeUrl };
  }

  async enableMfa(userId: string, code: string): Promise<void> {
    const secret = await this.redis.get(`mfa-setup:${userId}`);
    if (!secret) throw new BadRequestException('MFA setup session expired');

    const valid = authenticator.verify({ token: code, secret });
    if (!valid) throw new UnauthorizedException('Invalid MFA code');

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true, mfaSecret: secret },
    });

    await this.redis.del(`mfa-setup:${userId}`);
  }

  async forgotPassword(email: string, tenantSlug?: string): Promise<void> {
    const tenant = tenantSlug
      ? await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } })
      : null;

    const user = await this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        ...(tenant ? { tenantId: tenant.id } : {}),
      },
    });

    if (!user) return;

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    // Notification service would send email in production
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.userSession.updateMany({
        where: { userId: resetToken.userId, status: 'ACTIVE' },
        data: { status: 'REVOKED', revokedAt: new Date() },
      }),
    ]);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { include: { role: true } },
        userBranches: true,
      },
    });

    if (!user) throw new BadRequestException('User not found');

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName ?? undefined,
      tenantId: user.tenantId,
      organizationId: user.organizationId ?? undefined,
      roles: user.userRoles.map((ur) => ur.role.code),
      permissions: [],
      branchIds: user.userBranches.map((ub) => ub.branchId),
      mfaEnabled: user.mfaEnabled,
    };
  }
}
