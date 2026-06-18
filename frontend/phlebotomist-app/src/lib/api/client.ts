import type { ApiError } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_FIELD_API_URL ?? 'http://localhost:3016';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  token?: string | null;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(path.startsWith('http') ? path : `${API_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error: ApiError = {
      message:
        typeof payload === 'object' && payload && 'message' in payload
          ? String((payload as { message: string }).message)
          : `Request failed with status ${response.status}`,
      status: response.status,
    };
    throw error;
  }

  if (typeof payload === 'object' && payload && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

export async function apiClient<T>(
  path: string,
  { body, params, token, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const authToken = token ?? (typeof window !== 'undefined' ? getStoredToken() : null);

  const response = await fetch(buildUrl(path, params), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': process.env.NEXT_PUBLIC_TENANT_ID ?? '00000000-0000-4000-8000-000000000001',
      'x-organization-id':
        process.env.NEXT_PUBLIC_ORG_ID ?? '00000000-0000-4000-8000-000000000002',
      'x-branch-id':
        process.env.NEXT_PUBLIC_BRANCH_ID ?? '00000000-0000-4000-8000-000000000003',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return parseResponse<T>(response);
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('health-phlebotomist-auth');
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { state?: { tokens?: { accessToken?: string } } };
    return parsed.state?.tokens?.accessToken ?? null;
  } catch {
    return null;
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiClient<T>(path, { ...options, method: 'GET' as RequestMethod }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(path, { ...options, method: 'POST' as RequestMethod, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(path, { ...options, method: 'PATCH' as RequestMethod, body }),
};

export { API_URL };
