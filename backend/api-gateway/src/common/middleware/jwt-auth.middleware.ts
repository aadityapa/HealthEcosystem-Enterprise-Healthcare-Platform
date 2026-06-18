import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '@health/shared-types';
import { isPublicRoute } from '@/config/public-routes';
import { TENANT_ID_HEADER, BRANCH_ID_HEADER } from '@/common/constants';

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    const pathname = req.originalUrl.split('?')[0] ?? req.path;

    if (isPublicRoute(pathname)) {
      next();
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next(new UnauthorizedException('Missing or invalid authorization header'));
      return;
    }

    const token = authHeader.slice(7);

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('jwtSecret'),
      });

      (req as Request & { user?: JwtPayload }).user = payload;

      if (!req.headers[TENANT_ID_HEADER] && payload.tenantId) {
        req.headers[TENANT_ID_HEADER] = payload.tenantId;
      }

      if (!req.headers[BRANCH_ID_HEADER] && payload.branchIds?.[0]) {
        req.headers[BRANCH_ID_HEADER] = payload.branchIds[0];
      }

      next();
    } catch {
      next(new UnauthorizedException('Invalid or expired access token'));
    }
  }
}
