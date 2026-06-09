import { check, sleep } from 'k6';
import {
  DEFAULT_BASE_URL,
  DEFAULT_EMAIL,
  DEFAULT_PASSWORD,
  DEFAULT_TENANT_SLUG,
  THRESHOLDS,
  authHeaders,
  decodeJwtPayload,
  httpGet,
  httpPostJson,
  login,
} from './lib/common.js';

// 50,000 orders/hour ≈ 13.89 orders/sec. Scale down for local dev via ORDERS_PER_HOUR.
const ordersPerHour = Number(__ENV.ORDERS_PER_HOUR || 50000);
const ordersPerSecond = ordersPerHour / 3600;
const duration = __ENV.DURATION || '5m';
const preAllocatedVUs = Number(__ENV.PRE_ALLOCATED_VUS || 50);
const maxVUs = Number(__ENV.MAX_VUS || 200);

export const options = {
  scenarios: {
    lims_order_throughput: {
      executor: 'constant-arrival-rate',
      rate: ordersPerSecond,
      timeUnit: '1s',
      duration,
      preAllocatedVUs,
      maxVUs,
    },
  },
  thresholds: {
    ...THRESHOLDS,
    'http_req_duration{endpoint:order_create}': ['p(95)<200'],
  },
};

const baseUrl = DEFAULT_BASE_URL;

export function setup() {
  const loginRes = login(baseUrl, DEFAULT_EMAIL, DEFAULT_PASSWORD, DEFAULT_TENANT_SLUG);
  const token = loginRes.json('data.accessToken');
  const payload = decodeJwtPayload(token);
  const headers = authHeaders(token, payload);

  const testsRes = httpGet(`${baseUrl}/api/v1/lims/tests?limit=5`, headers);
  let testId = __ENV.TEST_ID || '';
  if (!testId && testsRes.status === 200) {
    const items = testsRes.json('data.items') || testsRes.json('data') || [];
    if (items.length > 0) {
      testId = items[0].id;
    }
  }

  const patientRes = httpPostJson(
    `${baseUrl}/api/v1/patients`,
    {
      firstName: 'Throughput',
      lastName: `Patient-${Date.now()}`,
      phone: `8${String(Date.now()).slice(-9)}`,
      gender: 'FEMALE',
    },
    headers,
  );

  const patientId =
    patientRes.status === 201 ? patientRes.json('data.id') : __ENV.PATIENT_ID || '';

  return { token, payload, patientId, testId };
}

export default function (data) {
  if (!data?.patientId) {
    sleep(1);
    return;
  }

  const headers = authHeaders(data.token, data.payload);
  const vuSuffix = `${__VU}-${__ITER}`;

  const res = httpPostJson(
    `${baseUrl}/api/v1/lims/orders`,
    {
      patientId: data.patientId,
      orderSource: 'WALK_IN',
      priority: __ITER % 10 === 0 ? 'STAT' : 'ROUTINE',
      notes: `load-test-${vuSuffix}`,
      items: data.testId
        ? [{ testId: data.testId, quantity: 1 }]
        : [{ quantity: 1 }],
    },
    headers,
    { endpoint: 'order_create' },
  );

  check(res, {
    'order created': (r) => r.status === 201,
    'order latency p95 target': (r) => r.timings.duration < 2000,
  });

  sleep(0.1);
}
