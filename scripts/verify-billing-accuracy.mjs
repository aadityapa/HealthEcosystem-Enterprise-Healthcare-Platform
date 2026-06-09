#!/usr/bin/env node
/**
 * Billing & GST accuracy verification.
 */
import { createRecorder, GATEWAY, login, authHeaders, request, isGatewayUp, round2 } from './lib/verify-client.mjs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function calcCgstSgst(taxable, cgstRate = 9, sgstRate = 9) {
  const cgst = round2((taxable * cgstRate) / 100);
  const sgst = round2((taxable * sgstRate) / 100);
  return { cgst, sgst, total: round2(cgst + sgst) };
}

function calcIgst(taxable, igstRate = 18) {
  return round2((taxable * igstRate) / 100);
}

async function main() {
  const { record, summarize } = createRecorder('billing-accuracy');
  console.log('\nBilling Accuracy Verification\n');

  // Inline GST scenarios (mirrors gst-calculation.service.ts)
  const scenarios = [
    {
      name: 'Intra-state CGST+SGST on ₹1000',
      fn: () => {
        const r = calcCgstSgst(1000);
        return r.cgst === 90 && r.sgst === 90 && r.total === 180;
      },
    },
    {
      name: 'Inter-state IGST on ₹1000',
      fn: () => calcIgst(1000) === 180,
    },
    {
      name: 'Zero taxable amount',
      fn: () => calcCgstSgst(0).total === 0,
    },
    {
      name: 'Rounding on ₹333.33',
      fn: () => {
        const r = calcCgstSgst(333.33);
        return r.cgst === 30 && r.sgst === 30;
      },
    },
    {
      name: 'CBC price ₹350 + 18% GST = ₹413',
      fn: () => {
        const tax = calcCgstSgst(350);
        return round2(350 + tax.total) === 413;
      },
    },
    {
      name: 'Corporate discount ₹50 off ₹350',
      fn: () => {
        const taxable = 300;
        const tax = calcCgstSgst(taxable);
        return round2(taxable + tax.total) === 354;
      },
    },
    {
      name: 'IGST 12% on ₹500',
      fn: () => calcIgst(500, 12) === 60,
    },
    {
      name: 'Line total consistency',
      fn: () => {
        const lines = [350, 500, 1200];
        const totalTax = lines.reduce((s, l) => s + calcCgstSgst(l).total, 0);
        return round2(totalTax) === 369; // 63 + 90 + 216
      },
    },
  ];

  for (const s of scenarios) {
    record(s.name, s.fn());
  }

  // Run billing-service Jest GST tests
  try {
    execSync('pnpm --filter @health/billing-service test', {
      cwd: ROOT,
      stdio: 'pipe',
      shell: true,
    });
    record('billing-service GST unit tests', true);
  } catch {
    record('billing-service GST unit tests', false);
  }

  // Live API invoice creation (if stack up)
  if (await isGatewayUp()) {
    try {
      const { token, tenantId, branchId } = await login();
      const headers = authHeaders(token, tenantId, branchId);

      const { data: patients } = await request(GATEWAY, 'GET', '/api/v1/patients?page=1&limit=1', { headers });
      const patientId = patients?.data?.items?.[0]?.id ?? patients?.items?.[0]?.id;

      if (patientId) {
        const { status, data } = await request(GATEWAY, 'POST', '/api/v1/billing/invoices', {
          headers,
          body: {
            patientId,
            invoiceType: 'WALK_IN',
            lines: [{ lineType: 'TEST', itemCode: 'CBC', unitPrice: 350, quantity: 1 }],
          },
        });
        const inv = data?.data ?? data;
        const total = Number(inv?.totalAmount ?? 0);
        const cgst = Number(inv?.cgstAmount ?? 0);
        const sgst = Number(inv?.sgstAmount ?? 0);
        record('Live invoice creation', status === 200 || status === 201, `total=₹${total}`);
        record('Live invoice GST split', cgst > 0 && sgst > 0, `CGST=${cgst} SGST=${sgst}`);
      } else {
        record('Live invoice creation', false, 'no patient in seed');
      }
    } catch (e) {
      record('Live invoice creation', false, e.message);
    }
  } else {
    record('Live invoice API', false, 'gateway down — GST math verified offline');
  }

  summarize();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
