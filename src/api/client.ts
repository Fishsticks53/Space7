import { API_URL } from '../config';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type Body = Record<string, unknown> | FormData;

export async function request<T>(
  path: string,
  options: { method?: string; body?: Body } = {},
): Promise<T> {
  const { method = 'GET', body } = options;
  const headers: Record<string, string> = {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  if (body && !(body instanceof FormData))
    headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body:
        body instanceof FormData
          ? body
          : body
          ? JSON.stringify(body)
          : undefined,
    });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection.', 0);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // A 401 on an authenticated call means the session has expired.
    if (response.status === 401 && authToken) onUnauthorized?.();
    // The backend reports failures as { error, details? }.
    const details = Array.isArray(data?.details) ? data.details.join('\n') : '';
    throw new ApiError(
      details || data?.error || `Request failed (${response.status})`,
      response.status,
    );
  }
  return data as T;
}
