#!/usr/bin/env node
/**
 * Integration smoke tests: auth, tenant context, gateway routing, key APIs.
 * Usage: node scripts/verify-integration.mjs [--gateway http://localhost:3000]
 *
 * Prerequisites: docker compose up -d && pnpm db:seed
 */

const GATEWAY = process.argv.includes('--gateway')
  ? process.argv[process.argv.indexOf('--gateway') + 1]
  : process.env.GATEWAY_URL ?? 'http://localhost:3000';

const DEMO = {
  email: 'admin@demolab.com',
  password: 'Admin@123456',
  tenantSlug: 'demo-lab',
};

const tests = [];
let token = null;
let tenantId = null;

function record(name, pass, detail = '') {
  tests.push({ name, pass, detail });
  const icon = pass ? '✓' : '✗';
  console.log(`  ${icon} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(method, path, { body, headers = {}, expectStatus } = {}) {
  const res = await fetch(`${GATEWAY}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (expectStatus !== undefined && res.status !== expectStatus) {
    throw new Error(`Expected ${expectStatus}, got ${res.status}: ${JSON.stringify(data)}`);
  }
  return { status: res.status, data };
}

async function run() {
  console.log(`\nIntegration Verification`);
  console.log(`Gateway: ${GATEWAY}\n`);

  // 1. Gateway health
  try {
    const { status } = await request('GET', '/health', { expectStatus: 200 });
    record('Gateway health', status === 200);
  } catch (e) {
    record('Gateway health', false, e.message);
  }

  // 2. Login
  try {
    const { data } = await request('POST', '/api/v1/auth/login', {
      body: { email: DEMO.email, password: DEMO.password },
      expectStatus: 200,
    });
    token = data?.data?.accessToken ?? data?.accessToken;
    tenantId = data?.data?.user?.tenantId ?? data?.user?.tenantId;
    record('Authentication (login)', !!token, token ? 'JWT received' : 'no token');
  } catch (e) {
    record('Authentication (login)', false, e.message);
  }

  if (!token) {
    console.log('\nCannot continue without auth token. Run: pnpm db:seed');
    summarize();
    process.exit(1);
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': tenantId ?? '',
  };

  // 3. Tenant resolution
  try {
    const { data } = await request('GET', '/api/v1/tenants/current', {
      headers: authHeaders,
      expectStatus: 200,
    });
    const slug = data?.data?.slug ?? data?.slug;
    record('Tenant context', slug === DEMO.tenantSlug, `slug=${slug}`);
  } catch (e) {
    record('Tenant context', false, e.message);
  }

  // 4. Protected endpoints (gateway routing)
  const protectedRoutes = [
    { name: 'Patients API', path: '/api/v1/patients?page=1&limit=1' },
    { name: 'LIMS orders API', path: '/api/v1/lims/orders?page=1&limit=1' },
    { name: 'Billing API', path: '/api/v1/billing/invoices?page=1&limit=1' },
    { name: 'Device API', path: '/api/v1/devices?page=1&limit=1' },
    { name: 'QC API', path: '/api/v1/qc/runs?page=1&limit=1' },
    { name: 'Security dashboard', path: '/api/v1/security/dashboard' },
    { name: 'Compliance dashboard', path: '/api/v1/compliance/dashboard' },
    { name: 'Commercial plans', path: '/api/v1/commercial/plans' },
    { name: 'Customer success onboarding', path: '/api/v1/customer-success/onboarding' },
    { name: 'Workflow definitions', path: '/api/v1/workflow/definitions?page=1&limit=1' },
  ];

  for (const route of protectedRoutes) {
    try {
      const { status } = await request('GET', route.path, { headers: authHeaders });
      record(route.name, status === 200, `HTTP ${status}`);
    } catch (e) {
      record(route.name, false, e.message);
    }
  }

  // 5. Unauthenticated access blocked
  try {
    const { status } = await request('GET', '/api/v1/patients');
    record('Unauthenticated blocked', status === 401 || status === 403, `HTTP ${status}`);
  } catch (e) {
    record('Unauthenticated blocked', false, e.message);
  }

  // 6. Missing tenant header
  try {
    const { status } = await request('GET', '/api/v1/patients?page=1&limit=1', {
      headers: { Authorization: `Bearer ${token}` },
    });
    record('Missing tenant header handled', status === 400 || status === 403 || status === 200, `HTTP ${status}`);
  } catch (e) {
    record('Missing tenant header handled', false, e.message);
  }

  // 7. SIEM public ingest (security-service public route)
  try {
    const { status } = await request('POST', '/api/v1/security/siem/ingest', {
      body: {
        eventType: 'verification.test',
        source: 'verify-integration',
        severity: 'info',
        message: 'Automated integration test event',
      },
    });
    record('SIEM ingest (public)', status === 200 || status === 201, `HTTP ${status}`);
  } catch (e) {
    record('SIEM ingest (public)', false, e.message);
  }

  summarize();
}

function summarize() {
  const passed = tests.filter((t) => t.pass).length;
  const failed = tests.filter((t) => !t.pass).length;
  console.log(`\nResult: ${passed}/${tests.length} passed, ${failed} failed`);

  if (failed > 0) {
    console.log('\nFailed tests indicate integration gaps. See docs/go-to-market/01-technical-due-diligence.md');
    process.exit(1);
  }

  console.log('\nIntegration smoke tests passed. Run full manual checklist for 100% verification.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
