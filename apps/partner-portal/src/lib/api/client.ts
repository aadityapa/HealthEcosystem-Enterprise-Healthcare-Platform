import type { ApiError } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

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
      code:
        typeof payload === 'object' && payload && 'code' in payload
          ? String((payload as { code: string }).code)
          : undefined,
    };
    throw error;
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
    const stored = localStorage.getItem('health-partner-auth');
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
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(path, { ...options, method: 'PUT' as RequestMethod, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(path, { ...options, method: 'PATCH' as RequestMethod, body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiClient<T>(path, { ...options, method: 'DELETE' as RequestMethod }),
};

export { API_URL };
