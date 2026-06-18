/**
 * AuditInterceptor Pattern
 * ────────────────────────
 * Copy this file into other NestJS services (e.g. lims-service, patient-service)
 * to emit append-only audit events to the audit-service.
 *
 * Prerequisites in the consuming service:
 *   - AUDIT_SERVICE_URL env var (e.g. http://audit-service:3005)
 *   - INTERNAL_SERVICE_KEY env var (shared secret with audit-service)
 *   - Register AuditInterceptor as APP_INTERCEPTOR or per-controller
 *
 * Usage:
 *   @UseInterceptors(AuditInterceptor)
 *   @Audit({ action: AuditAction.UPDATE, entityType: 'patient' })
 *   @Patch(':id')
 *   updatePatient(...) { ... }
 *
 * The interceptor fires AFTER the handler succeeds. Failed requests are not audited
 * to avoid polluting the immutable trail with aborted operations.
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditAction } from '@health/db';

export const AUDIT_METADATA_KEY = 'audit:metadata';

export interface AuditMetadata {
  action: AuditAction;
  entityType: string;
  /** Path param name or static entity id resolver key */
  entityIdParam?: string;
  /** Extract tenantId from request.user or headers */
  tenantIdSource?: 'user' | 'header';
  /** Include response body as newValue (use sparingly — PHI risk) */
  captureResponse?: boolean;
}

export const Audit = (metadata: AuditMetadata) =>
  SetMetadata(AUDIT_METADATA_KEY, metadata);

interface AuditRequestUser {
  sub?: string;
  tenantId?: string;
  organizationId?: string;
  branchId?: string;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly auditServiceUrl: string;
  private readonly internalServiceKey: string;

  constructor(private readonly reflector: Reflector) {
    this.auditServiceUrl =
      process.env.AUDIT_SERVICE_URL ?? 'http://localhost:3005';
    this.internalServiceKey = process.env.INTERNAL_SERVICE_KEY ?? '';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.get<AuditMetadata | undefined>(
      AUDIT_METADATA_KEY,
      context.getHandler(),
    );

    if (!metadata) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest();
    const user = request.user as AuditRequestUser | undefined;

    return next.handle().pipe(
      tap((responseBody) => {
        void this.emitAuditLog(request, user, metadata, responseBody);
      }),
    );
  }

  private async emitAuditLog(
    request: {
      method: string;
      params: Record<string, string>;
      body: Record<string, unknown>;
      headers: Record<string, string | string[] | undefined>;
      ip?: string;
    },
    user: AuditRequestUser | undefined,
    metadata: AuditMetadata,
    responseBody: unknown,
  ): Promise<void> {
    if (!this.internalServiceKey) {
      return;
    }

    const tenantId =
      metadata.tenantIdSource === 'header'
        ? String(request.headers['x-tenant-id'] ?? '')
        : user?.tenantId;

    if (!tenantId) {
      return;
    }

    const entityId = metadata.entityIdParam
      ? request.params[metadata.entityIdParam]
      : undefined;

    const payload = {
      tenantId,
      organizationId: user?.organizationId,
      branchId: user?.branchId,
      userId: user?.sub,
      action: metadata.action,
      entityType: metadata.entityType,
      entityId,
      oldValue: request.method === 'PATCH' || request.method === 'PUT'
        ? request.body
        : undefined,
      newValue: metadata.captureResponse ? responseBody : undefined,
    };

    try {
      await fetch(`${this.auditServiceUrl}/api/v1/audit/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service-Key': this.internalServiceKey,
          'X-Request-Id': String(request.headers['x-request-id'] ?? ''),
          'User-Agent': String(request.headers['user-agent'] ?? ''),
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // Audit emission must never break the primary request path.
    }
  }
}
