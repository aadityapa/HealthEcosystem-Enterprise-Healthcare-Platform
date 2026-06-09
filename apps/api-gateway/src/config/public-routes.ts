const PUBLIC_EXACT_PATHS = new Set([
  '/health',
  '/health/live',
  '/health/ready',
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/auth/mfa/verify',
  '/api/v1/auth/password/forgot',
  '/api/v1/auth/password/reset',
  '/api/v1/auth/health',
  '/api/v1/tenants/health',
  '/api/v1/patients/health',
  '/api/v1/lims/health',
  '/api/v1/audit/health',
  '/api/v1/devices/health',
  '/api/v1/master/health',
  '/api/v1/billing/health',
  '/api/v1/billing/payments/webhook/razorpay',
  '/api/v1/billing/payments/webhook/cashfree',
  '/api/v1/billing/payments/webhook/payu',
  '/api/v1/inventory/health',
  '/api/v1/qc/health',
  '/api/v1/crm/health',
  '/api/v1/ehr/health',
  '/api/v1/abdm/health',
  '/api/v1/abdm/exchange/webhook/hiu-callback',
  '/api/v1/analytics/health',
  '/api/v1/ai/health',
  '/api/v1/ai/whatsapp/webhook',
  '/api/v1/field/health',
  '/api/v1/radiology/health',
  '/api/v1/hrms/health',
  '/api/v1/marketplace/health',
  '/api/v1/observability/health',
  '/api/v1/data/health',
  '/api/v1/workflow/health',
  '/api/v1/dms/health',
  '/api/v1/branding/health',
  '/api/v1/branding/resolve',
  '/api/v1/agents/health',
  '/api/v1/i18n/health',
  '/api/v1/security/health',
  '/api/v1/compliance/health',
  '/api/v1/customer-success/health',
  '/api/v1/commercial/health',
  '/api/v1/security/siem/ingest',
]);

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) {
    return true;
  }

  const normalized = pathname.endsWith('/') && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;

  return PUBLIC_EXACT_PATHS.has(normalized);
}
