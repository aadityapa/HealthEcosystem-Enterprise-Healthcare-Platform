import http from 'k6/http';
import { check } from 'k6';
import encoding from 'k6/encoding';

export const DEFAULT_BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const DEFAULT_EMAIL = __ENV.LOAD_TEST_EMAIL || 'admin@demolab.com';
export const DEFAULT_PASSWORD = __ENV.LOAD_TEST_PASSWORD || 'Admin@123456';
export const DEFAULT_TENANT_SLUG = __ENV.TENANT_SLUG || 'demo-lab';

export const THRESHOLDS = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: ['p(95)<200'],
};

export function decodeJwtPayload(token) {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }
  const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
  try {
    return JSON.parse(encoding.b64decode(padded, 'rawstd', 's'));
  } catch (_) {
    return null;
  }
}

export function login(baseUrl, email, password, tenantSlug) {
  const res = loginRequest(baseUrl, email, password, tenantSlug);
  check(res, {
    'login status 200': (r) => r.status === 200,
    'login returns access token': (r) => {
      try {
        return Boolean(r.json('data.accessToken'));
      } catch (_) {
        return false;
      }
    },
  });
  return res;
}

export function loginRequest(baseUrl, email, password, tenantSlug) {
  return httpPostJson(`${baseUrl}/api/v1/auth/login`, {
    email,
    password,
    tenantSlug,
  });
}

export function authHeaders(token, jwtPayload, extraHeaders = {}) {
  const branchId =
    jwtPayload?.branchIds?.[0] ||
    __ENV.BRANCH_ID ||
    '00000000-0000-4000-a000-000000000002';

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'x-tenant-id': jwtPayload?.tenantId || __ENV.TENANT_ID || '',
    'x-organization-id':
      jwtPayload?.organizationId || __ENV.ORGANIZATION_ID || '00000000-0000-4000-a000-000000000001',
    'x-branch-id': branchId,
    'x-user-id': jwtPayload?.sub || __ENV.USER_ID || '',
    ...extraHeaders,
  };
}

export function httpPostJson(url, body, headers = {}, tags = {}) {
  return http.request('POST', url, JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    tags,
  });
}

export function httpGet(url, headers = {}, tags = {}) {
  return http.request('GET', url, null, { headers, tags });
}
