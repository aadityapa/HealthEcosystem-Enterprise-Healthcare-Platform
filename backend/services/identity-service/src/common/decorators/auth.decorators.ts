import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { JwtPayload } from '@health/shared-types';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const RequestMeta = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ipAddress: request.ip ?? request.headers['x-forwarded-for'],
      userAgent: request.headers['user-agent'],
      requestId: request.headers['x-request-id'],
    };
  },
);
