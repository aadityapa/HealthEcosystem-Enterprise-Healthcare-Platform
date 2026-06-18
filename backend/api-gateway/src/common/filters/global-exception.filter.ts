import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { REQUEST_ID_HEADER } from '@/common/constants';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();
    const requestId =
      request.requestId ??
      (typeof request.headers[REQUEST_ID_HEADER] === 'string'
        ? request.headers[REQUEST_ID_HEADER]
        : undefined);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const body =
        typeof exceptionResponse === 'string'
          ? { message: exceptionResponse }
          : (exceptionResponse as Record<string, unknown>);

      response.status(status).json({
        success: false,
        error: {
          code: body.error && typeof body.error === 'object' && 'code' in body.error
            ? String((body.error as { code: string }).code)
            : exception.name,
          message:
            body.message ??
            (body.error && typeof body.error === 'object' && 'message' in body.error
              ? String((body.error as { message: string }).message)
              : 'Request failed'),
          requestId,
        },
        ...(body.data ? { data: body.data } : {}),
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        requestId,
      },
    });
  }
}
