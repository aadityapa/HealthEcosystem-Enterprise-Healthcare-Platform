#!/usr/bin/env node
/**
 * Workflow engine verification — definitions, instances, tasks.
 */
import { createRecorder, GATEWAY, login, authHeaders, request, isGatewayUp } from './lib/verify-client.mjs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

async function main() {
  const { record, summarize } = createRecorder('workflow-engine');
  console.log('\nWorkflow Engine Verification\n');

  try {
    execSync('pnpm --filter @health/workflow-service test', {
      cwd: ROOT,
      stdio: 'pipe',
      shell: true,
    });
    record('workflow-service unit tests', true);
  } catch {
    record('workflow-service unit tests', false);
  }

  if (!(await isGatewayUp())) {
    record('Workflow API', false, 'gateway down');
    summarize();
    return;
  }

  let headers;
  try {
    const auth = await login();
    headers = authHeaders(auth.token, auth.tenantId, auth.branchId);
  } catch (e) {
    record('Auth', false, e.message);
    summarize();
    return;
  }

  let criticalDefId = null;

  try {
    const { data } = await request(GATEWAY, 'GET', '/api/v1/workflow/definitions?page=1&limit=20', { headers });
    const items = data?.data?.items ?? data?.items ?? [];
    record('Workflow definitions list', items.length > 0, `${items.length} definitions`);

    const critical = items.find((d) => d.code === 'critical-result' || d.name?.includes('Critical'));
    if (critical) {
      criticalDefId = critical.id;
      record('Critical result workflow seeded', true, critical.code ?? critical.name);
    } else {
      record('Critical result workflow seeded', false, 'run pnpm db:seed');
    }
  } catch (e) {
    record('Workflow definitions list', false, e.message);
  }

  try {
    const { status } = await request(GATEWAY, 'GET', '/api/v1/workflow/tasks?page=1&limit=10', { headers });
    record('Workflow tasks queue', status === 200, `HTTP ${status}`);
  } catch (e) {
    record('Workflow tasks queue', false, e.message);
  }

  if (criticalDefId) {
    try {
      const { status, data } = await request(GATEWAY, 'POST', '/api/v1/workflow/instances/start', {
        headers,
        body: {
          definitionId: criticalDefId,
          referenceType: 'verification',
          referenceId: '00000000-0000-4000-f000-000000000001',
          context: { source: 'verify-workflow-engine' },
        },
      });
      const instanceId = data?.data?.id ?? data?.id;
      record('Start workflow instance', status === 200 || status === 201, instanceId ? `id=${instanceId}` : `HTTP ${status}`);

      if (instanceId) {
        const { status: getStatus } = await request(GATEWAY, 'GET', `/api/v1/workflow/instances/${instanceId}`, {
          headers,
        });
        record('Workflow instance retrieval', getStatus === 200);
      }
    } catch (e) {
      record('Start workflow instance', false, e.message);
    }
  }

  try {
    const { status } = await request(GATEWAY, 'GET', '/api/v1/workflow/instances?page=1&limit=5', { headers });
    record('Workflow instances list', status === 200, `HTTP ${status}`);
  } catch (e) {
    record('Workflow instances list', false, e.message);
  }

  summarize();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
