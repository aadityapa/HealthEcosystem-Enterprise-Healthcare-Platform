#!/usr/bin/env node
/**
 * Start HealthEcosystem in lite (low RAM) or full mode, with LAN access.
 *
 * Usage:
 *   node scripts/start-dev.mjs           # lite + LAN (default)
 *   node scripts/start-dev.mjs --full    # all 35 services
 *   node scripts/start-dev.mjs --local   # localhost only
 */
import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT_MIN = 3000;
const PORT_MAX = 3130;

const args = process.argv.slice(2);
const fullMode = args.includes('--full');
const localOnly = args.includes('--local');
const withMobile = args.includes('--mobile') || fullMode;

/** Core stack for web-admin login, patients, LIMS, billing (~75% less RAM than full). */
const LITE_PACKAGES = [
  '@health/api-gateway',
  '@health/identity-service',
  '@health/tenant-service',
  '@health/patient-service',
  '@health/lims-service',
  '@health/audit-service',
  '@health/master-data-service',
  '@health/billing-service',
  '@health/web-admin',
];

const MOBILE_PACKAGES = ['@health/patient-mobile', '@health/field-service', '@health/phlebotomist-app'];

const APP_PORTS = {
  webAdmin: 3100,
  patientMobile: 3110,
  phlebotomistApp: 3120,
  partnerPortal: 3130,
  apiGateway: 3000,
};

function getLanIp() {
  const nets = networkInterfaces();
  for (const entries of Object.values(nets)) {
    for (const net of entries ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

function freePort(port) {
  if (process.platform !== 'win32') {
    try {
      execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null`, { stdio: 'ignore', shell: true });
    } catch {
      // Port already free.
    }
    return;
  }

  try {
    const output = execSync(`netstat -ano | findstr :${port}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const pids = new Set();

    for (const line of output.split('\n')) {
      if (!line.includes('LISTENING')) continue;
      const pid = line.trim().split(/\s+/).pop();
      if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid);
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' });
      } catch {
        // Process may have already exited.
      }
    }
  } catch {
    // Port already free.
  }
}

function loadEnvFile(envPath) {
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    const value = match[2].trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

function syncEnvFiles() {
  const rootEnv = join(root, '.env');
  const dbEnv = join(root, 'packages', 'db', '.env');

  if (!existsSync(rootEnv) && existsSync(join(root, '.env.example'))) {
    execSync(process.platform === 'win32' ? 'copy .env.example .env' : 'cp .env.example .env', {
      cwd: root,
      stdio: 'ignore',
      shell: true,
    });
  }

  if (existsSync(rootEnv)) {
    loadEnvFile(rootEnv);
    if (!existsSync(dbEnv)) {
      execSync(process.platform === 'win32' ? 'copy .env packages\\db\\.env' : 'cp .env packages/db/.env', {
        cwd: root,
        stdio: 'ignore',
        shell: true,
      });
    }
  }
}

function configureLan() {
  const lanIp = getLanIp();
  const host = localOnly ? '127.0.0.1' : '0.0.0.0';
  const apiHost = localOnly ? 'localhost' : lanIp;

  process.env.HOST = host;
  process.env.HOSTNAME = host;
  process.env.NEXT_PUBLIC_API_URL = `http://${apiHost}:${APP_PORTS.apiGateway}`;
  process.env.NEXT_PUBLIC_FIELD_API_URL = `http://${apiHost}:3016`;

  if (!localOnly) {
    const origins = [
      'http://localhost:3100',
      'http://localhost:3110',
      'http://localhost:3120',
      'http://localhost:3130',
      `http://${lanIp}:3100`,
      `http://${lanIp}:3110`,
      `http://${lanIp}:3120`,
      `http://${lanIp}:3130`,
    ];
    process.env.CORS_ORIGINS = origins.join(',');
  }

  return { lanIp, host, apiHost };
}

function printAccessUrls(lanIp) {
  const mode = fullMode ? 'FULL' : 'LITE';
  const network = localOnly ? 'localhost only' : `LAN (${lanIp})`;

  console.log('\n-------------------------------------------');
  console.log(`  HealthEcosystem — ${mode} mode | ${network}`);
  console.log('-------------------------------------------');

  if (localOnly) {
    console.log(`  Web Admin:       http://localhost:${APP_PORTS.webAdmin}`);
    console.log(`  API Gateway:     http://localhost:${APP_PORTS.apiGateway}`);
    if (withMobile) {
      console.log(`  Patient Mobile:  http://localhost:${APP_PORTS.patientMobile}`);
      console.log(`  Phlebotomist:    http://localhost:${APP_PORTS.phlebotomistApp}`);
    }
  } else {
    console.log(`  Web Admin:       http://${lanIp}:${APP_PORTS.webAdmin}`);
    console.log(`  API Gateway:     http://${lanIp}:${APP_PORTS.apiGateway}`);
    if (withMobile) {
      console.log(`  Patient Mobile:  http://${lanIp}:${APP_PORTS.patientMobile}`);
      console.log(`  Phlebotomist:    http://${lanIp}:${APP_PORTS.phlebotomistApp}`);
    }
    console.log('\n  Open these URLs on phones/tablets on the same Wi-Fi.');
    console.log('  If blocked, allow Node.js through Windows Firewall.');
  }

  console.log('\n  Login: admin@demolab.com / Admin@123456');
  console.log('  Full stack: pnpm dev:full');
  console.log('-------------------------------------------\n');
}

console.log(`Freeing ports ${PORT_MIN}-${PORT_MAX}...`);
for (let port = PORT_MIN; port <= PORT_MAX; port += 1) {
  freePort(port);
}

syncEnvFiles();
const { lanIp } = configureLan();

const packages = [...LITE_PACKAGES];
if (withMobile) packages.push(...MOBILE_PACKAGES);

const turboArgs = ['turbo', 'run', 'dev'];
if (!fullMode) {
  for (const pkg of packages) turboArgs.push(`--filter=${pkg}`);
}
const concurrency = fullMode ? 36 : packages.length + 1;
turboArgs.push(`--concurrency=${concurrency}`);

printAccessUrls(lanIp);

console.log(
  fullMode
    ? `Starting ALL services (high RAM usage, concurrency=${concurrency})...`
    : `Starting LITE stack (${packages.length} services, concurrency=${concurrency})...`,
);

const child = spawn('pnpm', turboArgs, {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
