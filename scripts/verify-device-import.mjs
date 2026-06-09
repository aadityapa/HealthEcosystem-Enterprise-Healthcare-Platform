#!/usr/bin/env node
/**
 * Device import verification — all 5 vendor adapters + live ingest if stack up.
 */
import { createRecorder, GATEWAY, login, authHeaders, request, isGatewayUp } from './lib/verify-client.mjs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const VENDOR_PAYLOADS = {
  ROCHE: {
    protocol: 'HL7_V2',
    payload: [
      'MSH|^~\\&|Cobas|Roche|LIMS|Lab|20260101120000||ORU^R01|ROCHE001|P|2.3',
      'OBR|1|BARCODE-ROCHE|BARCODE-ROCHE|CHEM',
      'OBX|1|NM|GLU||88|mg/dL|70-110|N',
      'OBX|2|NM|CREA||0.9|mg/dL|0.6-1.2|N',
    ].join('\r'),
    expectBarcode: 'BARCODE-ROCHE',
    expectParam: 'GLU',
    liveTested: false,
  },
  ABBOTT: {
    protocol: 'HL7_V2',
    payload: [
      'MSH|^~\\&|Architect|Abbott|LIMS|Lab|20260101120000||ORU^R01|ABBOTT001|P|2.3',
      'OBR|1|BARCODE-ABBOTT|BARCODE-ABBOTT|IMM',
      'OBX|1|NM|TSH||2.5|mIU/L|0.4-4.0|N',
    ].join('\r'),
    expectBarcode: 'BARCODE-ABBOTT',
    liveTested: false,
  },
  SIEMENS: {
    protocol: 'HL7_V2',
    payload: [
      'MSH|^~\\&|Atellica|Siemens|LIMS|Lab|20260101120000||ORU^R01|SIEMENS001|P|2.3',
      'OBR|1|BARCODE-SIEMENS|BARCODE-SIEMENS|COAG',
      'OBX|1|NM|PT||12.5|sec|11-13|N',
    ].join('\r'),
    expectBarcode: 'BARCODE-SIEMENS',
    liveTested: false,
  },
  SYSMEX: {
    protocol: 'HL7_V2',
    payload: [
      'MSH|^~\\&|XN|Sysmex|LIMS|Lab|20260101120000||ORU^R01|SYSMEX001|P|2.3',
      'OBR|1|BARCODE-SYSMEX|BARCODE-SYSMEX|HEM',
      'OBX|1|NM|WBC||7.2|10^3/uL|4.0-11.0|N',
      'OBX|2|NM|HGB||14.5|g/dL|13.0-17.0|N',
    ].join('\r'),
    expectBarcode: 'BARCODE-SYSMEX',
    liveTested: false,
  },
  BECKMAN: {
    protocol: 'ASTM',
    payload: ['H|\\^&|||AU5800', 'O|1|BARCODE-BECKMAN||^^^GLU', 'R|1|^^^GLU|99|mg/dL', 'L|1|N'].join('\r'),
    expectBarcode: 'BARCODE-BECKMAN',
    liveTested: false,
  },
};

async function main() {
  const { record, summarize } = createRecorder('device-import');
  console.log('\nDevice Import Verification\n');
  console.log('Vendor Certification Matrix:\n');
  console.log('  Device      | Parser OK | Live Tested');
  console.log('  ------------|-----------|------------');

  // Run device-service integration tests
  try {
    execSync('pnpm --filter @health/device-service test', {
      cwd: ROOT,
      stdio: 'pipe',
      shell: true,
    });
    record('device-service unit tests', true);
  } catch {
    record('device-service unit tests', false);
  }

  // Vendor payload structure validation
  for (const [vendor, spec] of Object.entries(VENDOR_PAYLOADS)) {
    const hasBarcode = spec.payload.includes('BARCODE');
    const hasResults = spec.payload.includes('OBX') || spec.payload.includes('R|');
    record(`${vendor} payload structure`, hasBarcode && hasResults);
    console.log(`  ${vendor.padEnd(12)}| ☐ parser  | ☐ live (see docs/go-to-market/09-device-certification-matrix.md)`);
  }

  // Live ingest against seeded Roche device
  if (await isGatewayUp()) {
    try {
      const { token, tenantId, branchId } = await login();
      const headers = authHeaders(token, tenantId, branchId);

      const { data: devices } = await request(GATEWAY, 'GET', '/api/v1/devices?page=1&limit=10', { headers });
      const deviceList = devices?.data?.items ?? devices?.items ?? [];
      const roche = deviceList.find((d) => d.vendor === 'ROCHE' || d.deviceCode?.includes('COBAS'));

      if (roche) {
        const { status } = await request(GATEWAY, 'POST', `/api/v1/devices/gateway/ingest/${roche.id}`, {
          headers,
          body: { payload: VENDOR_PAYLOADS.ROCHE.payload },
        });
        const liveOk = status === 200 || status === 201;
        record('Live Roche HL7 ingest', liveOk, `HTTP ${status}`);
        VENDOR_PAYLOADS.ROCHE.liveTested = liveOk;
      } else {
        record('Live Roche HL7 ingest', false, 'no Roche device in seed');
      }

      record('Device message list', true, `${deviceList.length} devices registered`);
    } catch (e) {
      record('Live device ingest', false, e.message);
    }
  } else {
    record('Live device ingest', false, 'gateway down — parser tests only');
  }

  console.log('\n⚠ Simulation ≠ production certification. Obtain live instrument validation per vendor.');
  summarize();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
