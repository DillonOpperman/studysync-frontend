import { apiUrl } from '../config/env';
import {
  AbortedError,
  ApiError,
  NetworkError,
  isTokenExpired,
  parseErrorBody,
} from './errors';

export type FetchLike = typeof fetch;

export type AccessTokenProvider = {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  onAuthFailure: () => Promise<void>;
};

const TIMEOUT_MS = 60_000;
const SKIP_REFRESH_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
]);

function redactHeaders(
  headers:
    | Headers
    | Array<[string, string]>
    | Record<string, string>
    | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!headers) {
    return out;
  }
  const entries =
    headers instanceof Headers
      ? [...headers.entries()]
      : Array.isArray(headers)
      ? headers
      : Object.entries(headers);
  for (const [key, value] of entries) {
    if (key.toLowerCase() === 'authorization') {
      out[key] = 'Bearer [redacted]';
    } else {
      out[key] = String(value);
    }
  }
  return out;
}

export class ApiClient {
  constructor(
    private readonly tokens: AccessTokenProvider,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  async request<T>(
    path: string,
    init: RequestInit & { skipAuth?: boolean; parseJson?: boolean } = {},
  ): Promise<T> {
    const { data } = await this.requestResult<T>(path, init);
    return data;
  }

  async requestResult<T>(
    path: string,
    init: RequestInit & { skipAuth?: boolean; parseJson?: boolean } = {},
  ): Promise<{ status: number; data: T }> {
    const { skipAuth, parseJson = true, ...rest } = init;
    try {
      return await this.send<T>(path, rest, skipAuth ?? false, parseJson);
    } catch (error) {
      const canRefresh =
        !skipAuth && !SKIP_REFRESH_PATHS.has(path) && isTokenExpired(error);
      if (!canRefresh) {
        throw error;
      }
      const next = await this.tokens.refreshAccessToken();
      if (!next) {
        await this.tokens.onAuthFailure();
        throw error;
      }
      try {
        return await this.send<T>(path, rest, false, parseJson);
      } catch (retryError) {
        if (isTokenExpired(retryError)) {
          await this.tokens.onAuthFailure();
        }
        throw retryError;
      }
    }
  }

  private async send<T>(
    path: string,
    init: RequestInit,
    skipAuth: boolean,
    parseJson: boolean,
  ): Promise<{ status: number; data: T }> {
    const headers = new Headers(init.headers);
    const isFormData =
      typeof FormData !== 'undefined' && init.body instanceof FormData;
    if (init.body && !headers.has('Content-Type') && !isFormData) {
      headers.set('Content-Type', 'application/json');
    }
    if (!skipAuth) {
      const access = this.tokens.getAccessToken();
      if (access) {
        headers.set('Authorization', `Bearer ${access}`);
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const onOuterAbort = () => controller.abort();
    init.signal?.addEventListener('abort', onOuterAbort);
    let response: Response;
    try {
      response = await this.fetchImpl(apiUrl(path), {
        ...init,
        headers,
        signal: controller.signal,
      });
    } catch (error) {
      if (init.signal?.aborted) {
        throw new AbortedError();
      }
      if (__DEV__) {
        console.debug('StudySync request failed', {
          path,
          headers: redactHeaders(headers),
        });
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError('The request timed out.');
      }
      throw new NetworkError();
    } finally {
      clearTimeout(timer);
      init.signal?.removeEventListener('abort', onOuterAbort);
    }

    if (response.status === 204) {
      return { status: 204, data: undefined as T };
    }

    const text = await response.text();
    if (!response.ok) {
      throw parseErrorBody(text, response.status);
    }
    if (!parseJson) {
      return { status: response.status, data: undefined as T };
    }
    if (!text.trim()) {
      throw new ApiError(
        response.status,
        'invalid_response',
        'Empty response from server',
      );
    }
    try {
      return { status: response.status, data: JSON.parse(text) as T };
    } catch {
      throw new ApiError(
        response.status,
        'invalid_response',
        'Response was not valid JSON',
      );
    }
  }
}
