import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { ServiceRequestContext } from '../context/request-context';

export const ServiceContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ServiceRequestContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.securityContext;
  },
);
