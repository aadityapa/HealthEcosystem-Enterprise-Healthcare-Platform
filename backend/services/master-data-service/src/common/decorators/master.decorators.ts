import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { MasterRequestContext } from '../context/master-context';

export const MasterContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): MasterRequestContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.masterContext;
  },
);
