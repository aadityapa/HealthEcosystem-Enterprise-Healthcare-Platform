#!/usr/bin/env node
/** Stop all HealthEcosystem dev processes on ports 3000-3130. */
import { execSync } from 'node:child_process';

const PORT_MIN = 3000;
const PORT_MAX = 3130;

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

console.log(`Stopping services on ports ${PORT_MIN}-${PORT_MAX}...`);
for (let port = PORT_MIN; port <= PORT_MAX; port += 1) {
  freePort(port);
}
console.log('Done.');
