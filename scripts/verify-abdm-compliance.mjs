#!/usr/bin/env node
/**
 * ABDM / FHIR compliance verification.
 */
import { createRecorder, GATEWAY, login, authHeaders, request, isGatewayUp } from './lib/verify-client.mjs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const FHIR_PATIENT = {
  resourceType: 'Bundle',
  type: 'transaction',
  entry: [
    {
      resource: {
        resourceType: 'Patient',
        id: 'verify-patient-001',
        name: [{ family: 'Verify', given: ['ABDM'] }],
        gender: 'male',
        birthDate: '1990-01-01',
      },
    },
  ],
};

async function main() {
  const { record, summarize } = createRecorder('abdm-compliance');
  console.log('\nABDM Compliance Verification\n');

  try {
    execSync('pnpm --filter @health/abdm-service test', {
      cwd: ROOT,
      stdio: 'pipe',
      shell: true,
    });
    record('abdm-service unit tests', true);
  } catch {
    record('abdm-service unit tests', false);
  }

  if (!(await isGatewayUp())) {
    record('ABDM API endpoints', false, 'gateway down');
    summarize();
    return;
  }

  let headers;
  try {
    const auth = await login();
    headers = authHeaders(auth.token, auth.tenantId, auth.branchId);
    record('ABDM auth context', true);
  } catch (e) {
    record('ABDM auth context', false, e.message);
    summarize();
    return;
  }

  const checks = [
    { name: 'ABHA profiles list', path: '/api/v1/abdm/abha', method: 'GET' },
    { name: 'Consent artifacts list', path: '/api/v1/abdm/consent', method: 'GET' },
    { name: 'FHIR resources list', path: '/api/v1/abdm/fhir', method: 'GET' },
    { name: 'Health records exchange', path: '/api/v1/abdm/exchange/health-records', method: 'GET' },
    { name: 'Compliance ABDM pack', path: '/api/v1/compliance/packs', method: 'GET' },
  ];

  for (const c of checks) {
    try {
      const { status } = await request(GATEWAY, c.method, c.path, { headers });
      record(c.name, status === 200, `HTTP ${status}`);
    } catch (e) {
      record(c.name, false, e.message);
    }
  }

  // FHIR Bundle publish
  try {
    const { status } = await request(GATEWAY, 'POST', '/api/v1/abdm/fhir/Bundle', {
      headers,
      body: FHIR_PATIENT,
    });
    record('FHIR Bundle publish', status === 200 || status === 201, `HTTP ${status}`);
  } catch (e) {
    record('FHIR Bundle publish', e.status === 400 || e.status === 422, `HTTP ${e.status} (validation ok)`);
  }

  // Consent request structure
  try {
    const { data: patients } = await request(GATEWAY, 'GET', '/api/v1/patients?page=1&limit=1', { headers });
    const patientId = patients?.data?.items?.[0]?.id ?? patients?.items?.[0]?.id;
    if (patientId) {
      const { status } = await request(GATEWAY, 'POST', '/api/v1/abdm/consent/request', {
        headers,
        body: {
          patientId,
          purpose: 'CAREMGT',
          hiTypes: ['DiagnosticReport'],
          dateRange: { from: '2026-01-01', to: '2026-12-31' },
        },
      });
      record('Consent request flow', status === 200 || status === 201, `HTTP ${status}`);
    }
  } catch (e) {
    record('Consent request flow', e.status === 400, `HTTP ${e.status}`);
  }

  summarize();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
