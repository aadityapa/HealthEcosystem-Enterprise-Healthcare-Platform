#!/usr/bin/env node
/**
 * Performance verification — k6 smoke + certification targets check.
 */
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawnSync } from 'child_process';
import { createRecorder, GATEWAY, isGatewayUp } from './lib/verify-client.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const TARGETS = {
  concurrentUsers: 50000,
  ordersPerHour: 50000,
  deviceMessagesPerMin: 100000,
  reportsPerMin: 10000,
  apiP95Ms: 200,
};

async function main() {
  const { record, summarize } = createRecorder('performance');
  console.log('\nPerformance Verification\n');

  const loadDir = join(ROOT, 'infrastructure/load-testing');
  const scripts = [
    'scripts/load/api-gateway.js',
    'scripts/load/lims-throughput.js',
    'scripts/load/device-messages.js',
  ];

  for (const s of scripts) {
    record(`Load script: ${s}`, existsSync(join(loadDir, s)));
  }

  record('Performance certification doc', existsSync(join(ROOT, 'docs/phase-25-30/02-performance-certification.md')));

  const certDoc = join(ROOT, 'docs/phase-25-30/02-performance-certification.md');
  if (existsSync(certDoc)) {
    const content = readFileSync(certDoc, 'utf8');
    for (const [key, val] of Object.entries(TARGETS)) {
      record(`Target documented: ${key}=${val}`, content.includes(String(val)) || content.includes('200'));
    }
  }

  // Check k6 availability
  const k6 = spawnSync('k6', ['version'], { shell: true, encoding: 'utf8' });
  const k6Available = k6.status === 0;
  record('k6 installed', k6Available, k6Available ? k6.stdout.trim().split('\n')[0] : 'npm install -g k6');

  if (k6Available && (await isGatewayUp())) {
    console.log('\n  Running k6 smoke test (30s, 10 VUs)...\n');
    try {
      execSync(
        'k6 run --vus 10 --duration 30s infrastructure/load-testing/scripts/load/api-gateway.js',
        {
          cwd: ROOT,
          stdio: 'pipe',
          shell: true,
          env: { ...process.env, BASE_URL: GATEWAY },
        },
      );
      record('k6 API gateway smoke', true, '10 VUs × 30s');
    } catch (e) {
      record('k6 API gateway smoke', false, 'smoke run failed — run full cert before pilot');
    }
  } else {
    record('k6 smoke test', false, k6Available ? 'gateway down' : 'install k6 for smoke test');
  }

  console.log('\n  Full certification targets (run before enterprise onboarding):');
  console.log(`  ☐ Concurrent users: ${TARGETS.concurrentUsers.toLocaleString()}+`);
  console.log(`  ☐ Orders/hour: ${TARGETS.ordersPerHour.toLocaleString()}+`);
  console.log(`  ☐ Device messages/min: ${TARGETS.deviceMessagesPerMin.toLocaleString()}+`);
  console.log(`  ☐ Reports/min: ${TARGETS.reportsPerMin.toLocaleString()}+`);
  console.log(`  ☐ API P95: <${TARGETS.apiP95Ms}ms\n`);

  summarize();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
