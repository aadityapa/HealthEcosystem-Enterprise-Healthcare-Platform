import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { BillingRequestContext } from '../context/billing-context';

export const BillingContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): BillingRequestContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.billingContext;
  },
);
