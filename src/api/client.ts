import { store } from '../api/store/store';

export const BASE_URL = 'http://192.168.1.5:8000/api';

// Custom error class
export class ApiError extends Error {
  status          : number;
  validationErrors: Record<string, string[]> | null;

  constructor(
    message         : string,
    status          : number,
    validationErrors: Record<string, string[]> | null = null,
  ) {
    super(message);
    this.name             = 'ApiError';
    this.status           = status;
    this.validationErrors = validationErrors;
  }
}

// Token helper
// Reads the Sanctum token directly from the Redux store at call time.
// Works for both persisted (rehydrated) and freshly-set tokens because
// it accesses store.getState() lazily — not at import time.
function getAuthHeader(): Record<string, string> {
  const token = store.getState().auth?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Core fetch wrapper
export async function apiFetch<T>(
  endpoint: string,
  options : RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept'      : 'application/json',
      ...getAuthHeader(),   // injected for every request; empty on public routes
      ...options.headers,   // caller can override (e.g. multipart/form-data)
    },
  });

  const json = await response.json();

  if (!response.ok) {

    // 422 — Laravel validation errors
    if (response.status === 422 && json.errors) {
      throw new ApiError(
        json.message ?? 'Validation failed.',
        422,
        json.errors,
      );
    }

    // 401 — token missing or expired
    if (response.status === 401) {
      throw new ApiError(json.message ?? 'Session expired. Please log in again.', 401);
    }

    // Everything else (403, 404, 500)
    throw new ApiError(
      json.message ?? `Request failed (${response.status})`,
      response.status,
    );
  }

  return json as T;
}