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

// Production target: 100,000 messages/min ≈ 1,667 msg/sec. Scale via MESSAGES_PER_MIN.
const messagesPerMin = Number(__ENV.MESSAGES_PER_MIN || 100000);
const messagesPerSecond = messagesPerMin / 60;
const duration = __ENV.DURATION || '3m';
const preAllocatedVUs = Number(__ENV.PRE_ALLOCATED_VUS || 100);
const maxVUs = Number(__ENV.MAX_VUS || 500);
export const options = {
  scenarios: {
    device_ingest: {
      executor: 'constant-arrival-rate',
      rate: messagesPerSecond,
      timeUnit: '1s',
      duration,
      preAllocatedVUs,
      maxVUs,
    },
  },
  thresholds: {
    ...THRESHOLDS,
    'http_req_duration{endpoint:device_ingest}': ['p(95)<200'],
  },
};

const baseUrl = DEFAULT_BASE_URL;

function sampleHl7Message(sampleId) {
  const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  return [
    `MSH|^~\\&|COBAS|ROCHE|LIMS|HEALTH|${ts}||ORU^R01|${sampleId}|P|2.5`,
    `PID|1||PAT${sampleId}^^^LIMS||Load^Test||19800101|M`,
    `OBR|1||ORD${sampleId}||CBC^Complete Blood Count`,
    `OBX|1|NM|6690-2^WBC||7.2|10^3/uL|4.0-11.0|N|||F`,
    `OBX|2|NM|789-8^RBC||4.8|10^6/uL|4.5-5.5|N|||F`,
    `OBX|3|NM|718-7^HGB||14.1|g/dL|13.0-17.0|N|||F`,
    `OBX|4|NM|777-3^PLT||250|10^3/uL|150-400|N|||F`,
  ].join('\r');
}

export function setup() {
  const loginRes = login(baseUrl, DEFAULT_EMAIL, DEFAULT_PASSWORD, DEFAULT_TENANT_SLUG);
  const token = loginRes.json('data.accessToken');
  const payload = decodeJwtPayload(token);
  const headers = authHeaders(token, payload);

  let resolvedDeviceId = __ENV.DEVICE_ID || '';
  if (!resolvedDeviceId) {
    const devicesRes = httpGet(`${baseUrl}/api/v1/devices?limit=1`, headers);
    if (devicesRes.status === 200) {
      const items = devicesRes.json('data.items') || devicesRes.json('data') || [];
      if (items.length > 0) {
        resolvedDeviceId = items[0].id;
      }
    }
  }

  return { token, payload, deviceId: resolvedDeviceId };
}

export default function (data) {
  if (!data?.deviceId) {
    sleep(1);
    return;
  }

  const headers = authHeaders(data.token, data.payload);
  const messageId = `VU${__VU}-ITER${__ITER}-${Date.now()}`;

  const res = httpPostJson(
    `${baseUrl}/api/v1/devices/ingest/${data.deviceId}`,
    { payload: sampleHl7Message(messageId) },
    headers,
    { endpoint: 'device_ingest' },
  );

  check(res, {
    'device ingest accepted': (r) => r.status === 201 || r.status === 200 || r.status === 202,
  });

  sleep(0.05);
}
