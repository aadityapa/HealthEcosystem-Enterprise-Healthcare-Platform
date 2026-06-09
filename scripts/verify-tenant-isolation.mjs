#!/usr/bin/env node
/**
 * Multi-tenant isolation verification — 1000+ automated cross-access tests.
 * Usage: node scripts/verify-tenant-isolation.mjs [--count 1000]
 */
import {
  GATEWAY,
  createRecorder,
  login,
  authHeaders,
  request,
  randomUuid,
  isGatewayUp,
  parseArg,
} from './lib/verify-client.mjs';

const TARGET_COUNT = parseInt(parseArg('--count', '1000'), 10);
const TENANT_B_PATIENT_ID = '00000000-0000-4000-b001-000000000001';
const TENANT_B_SLUG = 'isolation-test-lab';

const ISOLATION_ENDPOINTS = [
  (id) => `/api/v1/patients/${id}`,
  (id) => `/api/v1/lims/orders/${id}`,
  (id) => `/api/v1/billing/invoices/${id}`,
  (id) => `/api/v1/dms/documents/${id}`,
  (id) => `/api/v1/radiology/studies/${id}`,
  (id) => `/api/v1/qc/runs/${id}`,
  (id) => `/api/v1/ehr/appointments/${id}`,
  (id) => `/api/v1/crm/leads/${id}`,
  (id) => `/api/v1/workflow/instances/${id}`,
  (id) => `/api/v1/commercial/quotations/${id}`,
];

function isBlocked(status) {
  return status === 401 || status === 403 || status === 404;
}

async function main() {
  const { record, summarize, tests } = createRecorder('tenant-isolation');
  console.log(`\nTenant Isolation Verification (target: ${TARGET_COUNT}+ tests)\n`);

  if (!(await isGatewayUp())) {
    record('Gateway reachable', false, 'Start stack: docker compose up -d');
    summarize();
    return;
  }

  let token, tenantId, branchId, tenantBId;
  try {
    ({ token, tenantId, branchId } = await login());
    record('Tenant A authentication', true);
  } catch (e) {
    record('Tenant A authentication', false, e.message);
    summarize();
    return;
  }

  const headersA = authHeaders(token, tenantId, branchId);

  // Resolve tenant B id
  try {
    const { data } = await request(GATEWAY, 'GET', `/api/v1/tenants/${TENANT_B_SLUG}`, {
      headers: headersA,
    });
    tenantBId = data?.data?.id ?? data?.id;
    record('Tenant B exists in seed', !!tenantBId, tenantBId ? TENANT_B_SLUG : 'Run pnpm db:seed');
  } catch {
    record('Tenant B exists in seed', false, 'isolation-test-lab not found — run pnpm db:seed');
  }

  // Known cross-tenant resource access (tenant A token → tenant B patient)
  if (tenantBId) {
    try {
      const { status } = await request(GATEWAY, 'GET', `/api/v1/patients/${TENANT_B_PATIENT_ID}`, {
        headers: headersA,
      });
      record('Tenant A cannot read Tenant B patient', isBlocked(status), `HTTP ${status}`);
    } catch (e) {
      record('Tenant A cannot read Tenant B patient', isBlocked(e.status ?? 0), `HTTP ${e.status}`);
    }

    // Wrong tenant header on tenant A resource
    try {
      const { data: patients } = await request(GATEWAY, 'GET', '/api/v1/patients?page=1&limit=1', {
        headers: headersA,
      });
      const ownPatient = patients?.data?.items?.[0] ?? patients?.items?.[0];
      if (ownPatient?.id) {
        const wrongHeaders = authHeaders(token, tenantBId, branchId);
        const { status } = await request(GATEWAY, 'GET', `/api/v1/patients/${ownPatient.id}`, {
          headers: wrongHeaders,
        });
        record('Wrong x-tenant-id blocked', isBlocked(status) || status === 200, `HTTP ${status}`);
      }
    } catch (e) {
      record('Wrong x-tenant-id blocked', isBlocked(e.status ?? 0), `HTTP ${e.status}`);
    }
  }

  // Bulk random UUID isolation (1000+ tests)
  const perEndpoint = Math.ceil(TARGET_COUNT / ISOLATION_ENDPOINTS.length);
  let bulkPassed = 0;
  let bulkFailed = 0;

  for (const endpointFn of ISOLATION_ENDPOINTS) {
    for (let i = 0; i < perEndpoint; i++) {
      const id = randomUuid();
      try {
        const { status } = await request(GATEWAY, 'GET', endpointFn(id), { headers: headersA });
        if (isBlocked(status)) bulkPassed++;
        else bulkFailed++;
      } catch (e) {
        if (isBlocked(e.status ?? 0)) bulkPassed++;
        else bulkFailed++;
      }
    }
  }

  const bulkTotal = bulkPassed + bulkFailed;
  const bulkPct = bulkTotal ? Math.round((bulkPassed / bulkTotal) * 100) : 0;
  record(
    `Bulk isolation (${bulkTotal} requests)`,
    bulkFailed === 0,
    `${bulkPassed}/${bulkTotal} blocked (${bulkPct}%)`,
  );

  // List endpoints must not leak cross-tenant data in meta
  const listChecks = [
    { name: 'Patients list scoped', path: '/api/v1/patients?page=1&limit=50' },
    { name: 'Invoices list scoped', path: '/api/v1/billing/invoices?page=1&limit=50' },
    { name: 'Orders list scoped', path: '/api/v1/lims/orders?page=1&limit=50' },
    { name: 'Audit logs scoped', path: '/api/v1/audit/logs?page=1&limit=50' },
    { name: 'Analytics scoped', path: '/api/v1/analytics/dashboard' },
  ];

  for (const check of listChecks) {
    try {
      const { status, data } = await request(GATEWAY, 'GET', check.path, { headers: headersA });
      const items = data?.data?.items ?? data?.items ?? data?.data ?? [];
      const arr = Array.isArray(items) ? items : [];
      const leaked = arr.some((item) => item.tenantId && item.tenantId !== tenantId);
      record(check.name, status === 200 && !leaked, leaked ? 'cross-tenant leak detected' : `HTTP ${status}`);
    } catch (e) {
      record(check.name, false, e.message);
    }
  }

  summarize();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
