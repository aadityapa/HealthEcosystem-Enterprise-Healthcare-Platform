#!/usr/bin/env node
/**
 * Shared utilities for platform verification scripts.
 */

export const GATEWAY = process.argv.includes('--gateway')
  ? process.argv[process.argv.indexOf('--gateway') + 1]
  : process.env.GATEWAY_URL ?? 'http://localhost:3000';

export const DEMO = {
  email: process.env.VERIFY_EMAIL ?? 'admin@demolab.com',
  password: process.env.VERIFY_PASSWORD ?? 'Admin@123456',
  tenantSlug: 'demo-lab',
};

export function parseArg(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] : fallback;
}

export function createRecorder(suiteName) {
  const tests = [];
  return {
    tests,
    record(name, pass, detail = '') {
      tests.push({ name, pass, detail });
      const icon = pass ? '✓' : '✗';
      console.log(`  ${icon} ${name}${detail ? ` — ${detail}` : ''}`);
    },
    summarize(exitOnFail = true) {
      const passed = tests.filter((t) => t.pass).length;
      const failed = tests.filter((t) => !t.pass).length;
      const total = tests.length;
      const pct = total ? Math.round((passed / total) * 100) : 0;
      console.log(`\n[${suiteName}] ${passed}/${total} passed (${pct}%)`);
      if (failed > 0 && exitOnFail) {
        process.exit(1);
      }
      return { passed, failed, total, pct };
    },
  };
}

export async function request(gateway, method, path, { body, headers = {}, expectStatus, timeout = 10000 } = {}) {
  const res = await fetch(`${gateway}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeout),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (expectStatus !== undefined && res.status !== expectStatus) {
    const err = new Error(`Expected ${expectStatus}, got ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return { status: res.status, data };
}

export async function login(gateway = GATEWAY, creds = DEMO) {
  const { data } = await request(gateway, 'POST', '/api/v1/auth/login', {
    body: { email: creds.email, password: creds.password },
    expectStatus: 200,
  });
  const token = data?.data?.accessToken ?? data?.accessToken;
  const user = data?.data?.user ?? data?.user ?? {};
  const tenantId = user.tenantId;
  const branchId = user.branchIds?.[0] ?? user.branchId;
  return { token, tenantId, branchId, user };
}

export function authHeaders(token, tenantId, branchId) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': tenantId ?? '',
  };
  if (branchId) headers['x-branch-id'] = branchId;
  return headers;
}

export function randomUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function isGatewayUp(gateway = GATEWAY) {
  try {
    const res = await fetch(`${gateway}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export function round2(n) {
  return Math.round(n * 100) / 100;
}

export async function runJestTests(filter, label) {
  const { execSync } = await import('child_process');
  try {
    execSync(`pnpm --filter ${filter} test -- --passWithNoTests`, {
      stdio: 'pipe',
      cwd: new URL('../..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'),
      shell: true,
    });
    return { pass: true, detail: `${label} unit tests passed` };
  } catch (e) {
    return { pass: false, detail: `${label} tests failed` };
  }
}
