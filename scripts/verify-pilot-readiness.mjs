#!/usr/bin/env node
/**
 * Master pilot pre-flight runner + production readiness scorecard.
 * Usage: node scripts/verify-pilot-readiness.mjs
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SUITES = [
  { name: 'Health', script: 'verify-platform-health.mjs', weight: 'functional', pct: 5 },
  { name: 'Integration', script: 'verify-integration.mjs', weight: 'functional', pct: 5 },
  { name: 'Tenant Isolation', script: 'verify-tenant-isolation.mjs', weight: 'functional', pct: 5 },
  { name: 'Golden Workflows', script: 'verify-golden-workflows.mjs', weight: 'functional', pct: 5 },
  { name: 'Billing Accuracy', script: 'verify-billing-accuracy.mjs', weight: 'functional', pct: 5 },
  { name: 'Security', script: 'verify-security.mjs', weight: 'security', pct: 20 },
  { name: 'ABDM Compliance', script: 'verify-abdm-compliance.mjs', weight: 'compliance', pct: 5 },
  { name: 'Device Import', script: 'verify-device-import.mjs', weight: 'functional', pct: 5 },
  { name: 'Workflow Engine', script: 'verify-workflow-engine.mjs', weight: 'functional', pct: 5 },
  { name: 'DR Failover', script: 'verify-dr-failover.mjs', weight: 'dr', pct: 10 },
  { name: 'Performance', script: 'verify-performance.mjs', weight: 'performance', pct: 15 },
];

const WEIGHTS = {
  functional: 20,
  security: 20,
  clinical: 20,
  performance: 15,
  dr: 10,
  compliance: 10,
  documentation: 5,
};

const DOC_CHECKS = [
  'docs/go-to-market/01-technical-due-diligence.md',
  'docs/go-to-market/02-security-audit.md',
  'docs/go-to-market/03-clinical-validation.md',
  'docs/go-to-market/04-nabl-pilot-program.md',
  'docs/go-to-market/09-device-certification-matrix.md',
  'docs/go-to-market/10-clinical-signoff-pack.md',
  'docs/go-to-market/11-production-scorecard.md',
  'docs/go-to-market/12-pilot-success-metrics.md',
];

const CLINICAL_SIGNOFFS = [
  'docs/go-to-market/signoffs/pathology-cbc.pdf',
  'docs/go-to-market/signoffs/radiology-xray.pdf',
];

function runSuite(script) {
  const result = spawnSync('node', [join(ROOT, 'scripts', script)], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: true,
    timeout: 120000,
  });
  const output = (result.stdout ?? '') + (result.stderr ?? '');
  const pass = result.status === 0;
  const match = output.match(/(\d+)\/(\d+) passed/);
  const suitePct = match ? Math.round((parseInt(match[1], 10) / parseInt(match[2], 10)) * 100) : (pass ? 100 : 0);
  return { pass, suitePct, output };
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  PILOT PRE-FLIGHT — Production Readiness Scorecard');
  console.log('═══════════════════════════════════════════════════\n');

  const areaScores = {
    functional: [],
    security: [],
    clinical: [],
    performance: [],
    dr: [],
    compliance: [],
    documentation: [],
  };

  for (const suite of SUITES) {
    process.stdout.write(`Running ${suite.name}... `);
    const { pass, suitePct } = runSuite(suite.script);
    console.log(pass ? `PASS (${suitePct}%)` : `FAIL (${suitePct}%)`);
    areaScores[suite.weight].push(suitePct);
  }

  // Documentation score
  const docsPresent = DOC_CHECKS.filter((d) => existsSync(join(ROOT, d))).length;
  const docPct = Math.round((docsPresent / DOC_CHECKS.length) * 100);
  areaScores.documentation.push(docPct);
  console.log(`Documentation... ${docPct}% (${docsPresent}/${DOC_CHECKS.length} docs)`);

  // Clinical sign-off (manual)
  const signoffs = CLINICAL_SIGNOFFS.filter((d) => existsSync(join(ROOT, d))).length;
  const clinicalPct = signoffs > 0 ? 100 : 0;
  areaScores.clinical.push(clinicalPct);
  console.log(`Clinical sign-offs... ${clinicalPct}% (${signoffs}/${CLINICAL_SIGNOFFS.length} certificates — manual)`);

  // Compute weighted score
  function areaAvg(key) {
    const vals = areaScores[key];
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }

  const scores = {
    functional: areaAvg('functional'),
    security: areaAvg('security'),
    clinical: areaAvg('clinical'),
    performance: areaAvg('performance'),
    dr: areaAvg('dr'),
    compliance: areaAvg('compliance'),
    documentation: areaAvg('documentation'),
  };

  let total = 0;
  console.log('\n  Area                    Score   Weight   Weighted');
  console.log('  ─────────────────────────────────────────────────');
  for (const [area, weight] of Object.entries(WEIGHTS)) {
    const weighted = Math.round((scores[area] * weight) / 100);
    total += weighted;
    console.log(`  ${area.padEnd(22)} ${String(scores[area]).padStart(3)}%   ${String(weight).padStart(3)}%     ${weighted}%`);
  }
  console.log('  ─────────────────────────────────────────────────');
  console.log(`  TOTAL READINESS SCORE: ${total}%`);
  console.log(`  TARGET FOR ENTERPRISE: 90%+\n`);

  if (total >= 90) {
    console.log('  ✓ Ready for enterprise pilot onboarding\n');
    process.exit(0);
  } else if (total >= 70) {
    console.log('  ⚠ Ready for controlled NABL pilot (5 sites) — not enterprise sales\n');
    process.exit(0);
  } else {
    console.log('  ✗ Not ready for pilot — fix failing verification suites\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
