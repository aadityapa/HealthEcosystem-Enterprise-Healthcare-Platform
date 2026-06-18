import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
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

export interface RequestContext {
  tenantId: string;
  organizationId: string;
  branchId: string;
  userId: string;
}

export const RequestContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestContext => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    const branchId =
      (request.headers['x-branch-id'] as string) ??
      user.branchIds?.[0];

    if (!user.tenantId || !user.organizationId || !branchId) {
      throw new UnauthorizedException('Missing tenant context');
    }

    return {
      tenantId: user.tenantId,
      organizationId: user.organizationId!,
      branchId,
      userId: user.sub,
    };
  },
);
