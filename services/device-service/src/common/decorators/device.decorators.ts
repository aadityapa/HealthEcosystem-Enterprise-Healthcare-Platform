import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { DeviceRequestContext } from '../context/device-context';

export const DeviceContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): DeviceRequestContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.deviceContext;
  },
);
