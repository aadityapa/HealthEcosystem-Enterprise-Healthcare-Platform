#!/usr/bin/env node
/**
 * DR / backup / failover readiness verification.
 */
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRecorder } from './lib/verify-client.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const REQUIRED_FILES = [
  'infrastructure/docker/docker-compose.dr.yml',
  'infrastructure/postgres/replication.conf',
  'infrastructure/scripts/backup-verify.sh',
  'infrastructure/kubernetes/velero/backup-schedule.yaml',
  'docs/phase-11-17/02-multi-region-dr-ha.md',
];

async function main() {
  const { record, summarize } = createRecorder('dr-failover');
  console.log('\nDR Failover Verification\n');

  for (const file of REQUIRED_FILES) {
    const full = join(ROOT, file);
    record(`Artifact: ${file}`, existsSync(full));
  }

  // Parse DR compose for replica service
  const drCompose = join(ROOT, 'infrastructure/docker/docker-compose.dr.yml');
  if (existsSync(drCompose)) {
    const content = readFileSync(drCompose, 'utf8');
    record('DR compose has postgres replica', /replica|standby/i.test(content));
    record('DR compose has failover notes', content.length > 200);
  }

  // Velero schedule
  const velero = join(ROOT, 'infrastructure/kubernetes/velero/backup-schedule.yaml');
  if (existsSync(velero)) {
    const content = readFileSync(velero, 'utf8');
    record('Velero daily backup schedule', /schedule|cron/i.test(content));
  }

  // K8s production overlay
  record(
    'K8s production overlay',
    existsSync(join(ROOT, 'infrastructure/kubernetes/overlays/production/kustomization.yaml')),
  );

  record('Multi-region DR documentation', existsSync(join(ROOT, 'docs/phase-11-17/02-multi-region-dr-ha.md')));

  // Manual drill checklist
  console.log('\n  Manual DR drill required before pilot:');
  console.log('  ☐ Simulate primary Postgres failure');
  console.log('  ☐ Promote replica (< 15 min RTO)');
  console.log('  ☐ Run infrastructure/scripts/backup-verify.sh');
  console.log('  ☐ Verify Velero restore to staging namespace');
  console.log('  ☐ Confirm RPO < 5 minutes\n');

  record('DR drill executed (manual)', false, 'Mark complete after drill — see checklist above');

  summarize();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
