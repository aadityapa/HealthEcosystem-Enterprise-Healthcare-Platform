export interface ServiceTarget {
  name: string;
  baseUrl: string;
  healthPath: string;
  pathPrefixes: string[];
}

export interface GatewayConfig {
  port: number;
  jwtSecret: string;
  redisUrl: string;
  rateLimitPoints: number;
  rateLimitDurationSec: number;
  corsOrigins: string[];
  services: ServiceTarget[];
}

function serviceUrl(envKey: string, fallbackHost: string, port: number): string {
  return process.env[envKey] ?? `http://${fallbackHost}:${port}`;
}

export default (): GatewayConfig => ({
  port: parseInt(process.env.API_GATEWAY_PORT ?? '3000', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production-use-256-bit-secret',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  rateLimitPoints: parseInt(process.env.RATE_LIMIT_POINTS ?? '120', 10),
  rateLimitDurationSec: parseInt(process.env.RATE_LIMIT_DURATION_SEC ?? '60', 10),
  corsOrigins: process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? [
    'http://localhost:3100',
  ],
  services: [
    {
      name: 'identity-service',
      baseUrl: serviceUrl('IDENTITY_SERVICE_URL', 'localhost', 3001),
      healthPath: '/api/v1/auth/health',
      pathPrefixes: ['/api/v1/auth', '/api/v1/users'],
    },
    {
      name: 'tenant-service',
      baseUrl: serviceUrl('TENANT_SERVICE_URL', 'localhost', 3002),
      healthPath: '/api/v1/tenants/health',
      pathPrefixes: ['/api/v1/tenants', '/api/v1/organizations', '/api/v1/branches'],
    },
    {
      name: 'patient-service',
      baseUrl: serviceUrl('PATIENT_SERVICE_URL', 'localhost', 3003),
      healthPath: '/api/v1/patients/health',
      pathPrefixes: ['/api/v1/patients'],
    },
    {
      name: 'lims-service',
      baseUrl: serviceUrl('LIMS_SERVICE_URL', 'localhost', 3004),
      healthPath: '/api/v1/lims/health',
      pathPrefixes: ['/api/v1/lims'],
    },
    {
      name: 'audit-service',
      baseUrl: serviceUrl('AUDIT_SERVICE_URL', 'localhost', 3005),
      healthPath: '/api/v1/audit/health',
      pathPrefixes: ['/api/v1/audit'],
    },
    {
      name: 'device-service',
      baseUrl: serviceUrl('DEVICE_SERVICE_URL', 'localhost', 3006),
      healthPath: '/api/v1/devices/health',
      pathPrefixes: ['/api/v1/devices'],
    },
    {
      name: 'master-data-service',
      baseUrl: serviceUrl('MASTER_DATA_SERVICE_URL', 'localhost', 3007),
      healthPath: '/api/v1/master/health',
      pathPrefixes: ['/api/v1/master'],
    },
    {
      name: 'billing-service',
      baseUrl: serviceUrl('BILLING_SERVICE_URL', 'localhost', 3008),
      healthPath: '/api/v1/billing/health',
      pathPrefixes: ['/api/v1/billing'],
    },
    {
      name: 'inventory-service',
      baseUrl: serviceUrl('INVENTORY_SERVICE_URL', 'localhost', 3009),
      healthPath: '/api/v1/inventory/health',
      pathPrefixes: ['/api/v1/inventory'],
    },
    {
      name: 'qc-service',
      baseUrl: serviceUrl('QC_SERVICE_URL', 'localhost', 3010),
      healthPath: '/api/v1/qc/health',
      pathPrefixes: ['/api/v1/qc'],
    },
    {
      name: 'crm-service',
      baseUrl: serviceUrl('CRM_SERVICE_URL', 'localhost', 3011),
      healthPath: '/api/v1/crm/health',
      pathPrefixes: ['/api/v1/crm'],
    },
    {
      name: 'ehr-service',
      baseUrl: serviceUrl('EHR_SERVICE_URL', 'localhost', 3012),
      healthPath: '/api/v1/ehr/health',
      pathPrefixes: ['/api/v1/ehr'],
    },
    {
      name: 'abdm-service',
      baseUrl: serviceUrl('ABDM_SERVICE_URL', 'localhost', 3013),
      healthPath: '/api/v1/abdm/health',
      pathPrefixes: ['/api/v1/abdm'],
    },
    {
      name: 'analytics-service',
      baseUrl: serviceUrl('ANALYTICS_SERVICE_URL', 'localhost', 3014),
      healthPath: '/api/v1/analytics/health',
      pathPrefixes: ['/api/v1/analytics'],
    },
    {
      name: 'ai-service',
      baseUrl: serviceUrl('AI_SERVICE_URL', 'localhost', 3015),
      healthPath: '/api/v1/ai/health',
      pathPrefixes: ['/api/v1/ai'],
    },
    {
      name: 'field-service',
      baseUrl: serviceUrl('FIELD_SERVICE_URL', 'localhost', 3016),
      healthPath: '/api/v1/field/health',
      pathPrefixes: ['/api/v1/field'],
    },
    {
      name: 'radiology-service',
      baseUrl: serviceUrl('RADIOLOGY_SERVICE_URL', 'localhost', 3017),
      healthPath: '/api/v1/radiology/health',
      pathPrefixes: ['/api/v1/radiology'],
    },
    {
      name: 'hrms-service',
      baseUrl: serviceUrl('HRMS_SERVICE_URL', 'localhost', 3018),
      healthPath: '/api/v1/hrms/health',
      pathPrefixes: ['/api/v1/hrms'],
    },
    {
      name: 'marketplace-service',
      baseUrl: serviceUrl('MARKETPLACE_SERVICE_URL', 'localhost', 3019),
      healthPath: '/api/v1/marketplace/health',
      pathPrefixes: ['/api/v1/marketplace'],
    },
    {
      name: 'observability-service',
      baseUrl: serviceUrl('OBSERVABILITY_SERVICE_URL', 'localhost', 3020),
      healthPath: '/api/v1/observability/health',
      pathPrefixes: ['/api/v1/observability'],
    },
    {
      name: 'data-platform-service',
      baseUrl: serviceUrl('DATA_PLATFORM_SERVICE_URL', 'localhost', 3021),
      healthPath: '/api/v1/data/health',
      pathPrefixes: ['/api/v1/data'],
    },
    {
      name: 'workflow-service',
      baseUrl: serviceUrl('WORKFLOW_SERVICE_URL', 'localhost', 3022),
      healthPath: '/api/v1/workflow/health',
      pathPrefixes: ['/api/v1/workflow'],
    },
    {
      name: 'dms-service',
      baseUrl: serviceUrl('DMS_SERVICE_URL', 'localhost', 3023),
      healthPath: '/api/v1/dms/health',
      pathPrefixes: ['/api/v1/dms'],
    },
    {
      name: 'branding-service',
      baseUrl: serviceUrl('BRANDING_SERVICE_URL', 'localhost', 3024),
      healthPath: '/api/v1/branding/health',
      pathPrefixes: ['/api/v1/branding'],
    },
    {
      name: 'agents-service',
      baseUrl: serviceUrl('AGENTS_SERVICE_URL', 'localhost', 3025),
      healthPath: '/api/v1/agents/health',
      pathPrefixes: ['/api/v1/agents'],
    },
    {
      name: 'i18n-service',
      baseUrl: serviceUrl('I18N_SERVICE_URL', 'localhost', 3026),
      healthPath: '/api/v1/i18n/health',
      pathPrefixes: ['/api/v1/i18n'],
    },
    {
      name: 'security-service',
      baseUrl: serviceUrl('SECURITY_SERVICE_URL', 'localhost', 3027),
      healthPath: '/api/v1/security/health',
      pathPrefixes: ['/api/v1/security'],
    },
    {
      name: 'compliance-service',
      baseUrl: serviceUrl('COMPLIANCE_SERVICE_URL', 'localhost', 3028),
      healthPath: '/api/v1/compliance/health',
      pathPrefixes: ['/api/v1/compliance'],
    },
    {
      name: 'customer-success-service',
      baseUrl: serviceUrl('CUSTOMER_SUCCESS_SERVICE_URL', 'localhost', 3029),
      healthPath: '/api/v1/customer-success/health',
      pathPrefixes: ['/api/v1/customer-success'],
    },
    {
      name: 'commercial-service',
      baseUrl: serviceUrl('COMMERCIAL_SERVICE_URL', 'localhost', 3030),
      healthPath: '/api/v1/commercial/health',
      pathPrefixes: ['/api/v1/commercial'],
    },
  ],
});
