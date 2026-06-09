#!/usr/bin/env node
/**
 * Health-check all microservices + API gateway.
 * Usage: node scripts/verify-platform-health.mjs [--base-url http://localhost]
 */

const BASE = process.argv.includes('--base-url')
  ? process.argv[process.argv.indexOf('--base-url') + 1]
  : process.env.API_BASE_URL ?? 'http://localhost';

const SERVICES = [
  { name: 'api-gateway', port: 3000, path: '/health' },
  { name: 'identity-service', port: 3001, path: '/api/v1/auth/health' },
  { name: 'tenant-service', port: 3002, path: '/api/v1/tenants/health' },
  { name: 'patient-service', port: 3003, path: '/api/v1/patients/health' },
  { name: 'lims-service', port: 3004, path: '/api/v1/lims/health' },
  { name: 'audit-service', port: 3005, path: '/api/v1/audit/health' },
  { name: 'device-service', port: 3006, path: '/api/v1/devices/health' },
  { name: 'master-data-service', port: 3007, path: '/api/v1/master/health' },
  { name: 'billing-service', port: 3008, path: '/api/v1/billing/health' },
  { name: 'inventory-service', port: 3009, path: '/api/v1/inventory/health' },
  { name: 'qc-service', port: 3010, path: '/api/v1/qc/health' },
  { name: 'crm-service', port: 3011, path: '/api/v1/crm/health' },
  { name: 'ehr-service', port: 3012, path: '/api/v1/ehr/health' },
  { name: 'abdm-service', port: 3013, path: '/api/v1/abdm/health' },
  { name: 'analytics-service', port: 3014, path: '/api/v1/analytics/health' },
  { name: 'ai-service', port: 3015, path: '/api/v1/ai/health' },
  { name: 'field-service', port: 3016, path: '/api/v1/field/health' },
  { name: 'radiology-service', port: 3017, path: '/api/v1/radiology/health' },
  { name: 'hrms-service', port: 3018, path: '/api/v1/hrms/health' },
  { name: 'marketplace-service', port: 3019, path: '/api/v1/marketplace/health' },
  { name: 'observability-service', port: 3020, path: '/api/v1/observability/health' },
  { name: 'data-platform-service', port: 3021, path: '/api/v1/data/health' },
  { name: 'workflow-service', port: 3022, path: '/api/v1/workflow/health' },
  { name: 'dms-service', port: 3023, path: '/api/v1/dms/health' },
  { name: 'branding-service', port: 3024, path: '/api/v1/branding/health' },
  { name: 'agents-service', port: 3025, path: '/api/v1/agents/health' },
  { name: 'i18n-service', port: 3026, path: '/api/v1/i18n/health' },
  { name: 'security-service', port: 3027, path: '/api/v1/security/health' },
  { name: 'compliance-service', port: 3028, path: '/api/v1/compliance/health' },
  { name: 'customer-success-service', port: 3029, path: '/api/v1/customer-success/health' },
  { name: 'commercial-service', port: 3030, path: '/api/v1/commercial/health' },
];

const TIMEOUT_MS = 5000;

async function checkService(service) {
  const url = `${BASE}:${service.port}${service.path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const ms = Date.now() - start;
    if (res.ok) {
      return { ...service, status: 'PASS', ms, code: res.status };
    }
    return { ...service, status: 'FAIL', ms, code: res.status, error: `HTTP ${res.status}` };
  } catch (err) {
    return { ...service, status: 'FAIL', ms: Date.now() - start, error: err.message };
  }
}

async function main() {
  console.log(`\nHealthEcosystem Platform Verification`);
  console.log(`Base URL: ${BASE}`);
  console.log(`Services: ${SERVICES.length}\n`);

  const results = await Promise.all(SERVICES.map(checkService));

  const maxName = Math.max(...results.map((r) => r.name.length));
  let passed = 0;
  let failed = 0;

  for (const r of results) {
    const icon = r.status === 'PASS' ? '✓' : '✗';
    const timing = r.ms ? `${r.ms}ms` : '—';
    const detail = r.error ? ` (${r.error})` : '';
    console.log(`  ${icon} ${r.name.padEnd(maxName)}  ${r.status.padEnd(4)}  ${timing}${detail}`);
    if (r.status === 'PASS') passed++;
    else failed++;
  }

  console.log(`\nResult: ${passed}/${SERVICES.length} passed, ${failed} failed`);

  if (failed > 0) {
    console.log('\nStart missing services: docker compose up -d');
    process.exit(1);
  }

  console.log('\nAll services healthy.');
  process.exit(0);
}

main();
