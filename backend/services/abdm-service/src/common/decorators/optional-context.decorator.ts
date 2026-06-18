import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { ServiceRequestContext } from '../context/request-context';

export const OptionalServiceContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ServiceRequestContext | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.abdmContext;
  },
);
