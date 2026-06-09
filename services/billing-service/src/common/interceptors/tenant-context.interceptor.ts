import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { setTenantContext } from '@health/db';
import { TENANT_HEADERS } from '../context/billing-context';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const path = request.path as string;

    if (path.includes('/health') || path.includes('/payments/webhook/')) {
      return next.handle();
    }

    const tenantId = request.headers[TENANT_HEADERS.tenantId] as string | undefined;
    const organizationId = request.headers[TENANT_HEADERS.organizationId] as
      | string
      | undefined;
    const branchId = request.headers[TENANT_HEADERS.branchId] as string | undefined;
    const userId = request.headers[TENANT_HEADERS.userId] as string | undefined;

    if (!tenantId || !organizationId || !branchId || !userId) {
      throw new BadRequestException(
        'Missing required headers: x-tenant-id, x-organization-id, x-branch-id, x-user-id',
      );
    }

    request.billingContext = { tenantId, organizationId, branchId, userId };
    await setTenantContext(tenantId, organizationId, branchId);

    return next.handle();
  }
}
