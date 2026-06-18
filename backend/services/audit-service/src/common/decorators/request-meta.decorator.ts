import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestMetaData {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export const RequestMeta = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestMetaData => {
    const request = ctx.switchToHttp().getRequest();
    const forwarded = request.headers['x-forwarded-for'];
    const ipAddress =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0]?.trim()
        : request.ip;

    return {
      ipAddress,
      userAgent: request.headers['user-agent'],
      requestId: request.headers['x-request-id'],
    };
  },
);
