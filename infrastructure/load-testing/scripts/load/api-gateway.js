import { check, group, sleep } from 'k6';
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

export const options = {
  scenarios: {
    gateway_smoke: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 25 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '15s',
    },
  },
  thresholds: THRESHOLDS,
};

const baseUrl = DEFAULT_BASE_URL;

export function setup() {
  const loginRes = login(baseUrl, DEFAULT_EMAIL, DEFAULT_PASSWORD, DEFAULT_TENANT_SLUG);
  const token = loginRes.json('data.accessToken');
  const payload = decodeJwtPayload(token);
  const headers = authHeaders(token, payload);

  const patientRes = httpPostJson(
    `${baseUrl}/api/v1/patients`,
    {
      firstName: 'Load',
      lastName: 'Test',
      phone: `9${String(__VU).padStart(9, '0').slice(0, 9)}`,
      gender: 'MALE',
    },
    headers,
  );

  let patientId = '';
  if (patientRes.status === 201) {
    patientId = patientRes.json('data.id');
  }

  return { token, payload, patientId };
}

export default function (data) {
  const token = data?.token;
  const payload = data?.payload;
  const patientId = data?.patientId;
  const headers = authHeaders(token, payload);

  group('Gateway Health', () => {
    const live = httpGet(`${baseUrl}/health/live`);
    check(live, { 'live ok': (r) => r.status === 200 });

    const ready = httpGet(`${baseUrl}/health/ready`);
    check(ready, { 'ready ok': (r) => r.status === 200 });
  });

  group('Auth', () => {
    const profile = httpGet(`${baseUrl}/api/v1/auth/me`, headers);
    check(profile, { 'profile ok': (r) => r.status === 200 || r.status === 404 });
  });

  group('Patients', () => {
    const list = httpGet(`${baseUrl}/api/v1/patients?page=1&limit=10`, headers);
    check(list, { 'patients list ok': (r) => r.status === 200 });

    if (patientId) {
      const detail = httpGet(`${baseUrl}/api/v1/patients/${patientId}`, headers);
      check(detail, { 'patient detail ok': (r) => r.status === 200 });
    }
  });

  group('LIMS Orders', () => {
    const orders = httpGet(`${baseUrl}/api/v1/lims/orders?page=1&limit=10`, headers);
    check(orders, { 'orders list ok': (r) => r.status === 200 });

    if (patientId) {
      const create = httpPostJson(
        `${baseUrl}/api/v1/lims/orders`,
        {
          patientId,
          orderSource: 'WALK_IN',
          priority: 'ROUTINE',
          items: [{ quantity: 1 }],
        },
        headers,
      );
      check(create, {
        'order create accepted': (r) => r.status === 201 || r.status === 400,
      });
    }
  });

  sleep(0.5);
}
