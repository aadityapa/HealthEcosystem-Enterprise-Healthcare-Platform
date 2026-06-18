import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { LimsRequestContext } from '../context/lims-context';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const LimsContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): LimsRequestContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.limsContext;
  },
);
