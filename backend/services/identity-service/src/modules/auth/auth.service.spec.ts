import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PRISMA } from '@/database/database.module';
import { REDIS } from '@/redis/redis.module';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: Record<string, unknown>;
  let redis: Record<string, jest.Mock>;

  const mockUser = {
    id: 'user-1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    email: 'test@example.com',
    passwordHash: '',
    firstName: 'Test',
    lastName: 'User',
    status: 'ACTIVE',
    mfaEnabled: false,
    mfaSecret: null,
    userRoles: [{
      role: {
        code: 'tenant_admin',
        rolePermissions: [{ permission: { code: 'patient.read' } }],
      },
      branchId: 'branch-1',
    }],
    userBranches: [{ branchId: 'branch-1' }],
  };

  beforeEach(async () => {
    mockUser.passwordHash = await bcrypt.hash('Password123!', 12);

    prisma = {
      tenant: { findUnique: jest.fn() },
      user: {
        findFirst: jest.fn().mockResolvedValue(mockUser),
        findUnique: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue(mockUser),
      },
      userSession: {
        create: jest.fn().mockResolvedValue({ id: 'session-1' }),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      passwordResetToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    redis = {
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PRISMA, useValue: prisma },
        { provide: REDIS, useValue: redis },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('access-token') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultVal?: string) => defaultVal),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      const user = await service.validateUser('test@example.com', 'Password123!');
      expect(user.email).toBe('test@example.com');
    });

    it('should throw for invalid password', async () => {
      await expect(
        service.validateUser('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return tokens for valid login without MFA', async () => {
      const result = await service.login('test@example.com', 'Password123!');
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.mfaRequired).toBeUndefined();
    });

    it('should require MFA when enabled', async () => {
      (prisma.user as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        ...mockUser,
        mfaEnabled: true,
      });

      const result = await service.login('test@example.com', 'Password123!');
      expect(result.mfaRequired).toBe(true);
      expect(result.mfaToken).toBeDefined();
    });
  });
});
