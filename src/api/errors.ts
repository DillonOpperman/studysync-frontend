import type { ApiErrorBody } from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export class NetworkError extends Error {
  constructor(
    message = 'Unable to reach StudySync. Check that the API is running.',
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export function isTokenExpired(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === 'token_expired' || error.status === 401)
  );
}

export function isInvalidRefresh(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'invalid_refresh_token';
}

export function parseErrorBody(text: string, status: number): ApiError {
  if (!text.trim()) {
    if (status === 204) {
      return new ApiError(status, 'empty', '');
    }
    return new ApiError(
      status,
      'invalid_response',
      `Request failed (${status})`,
    );
  }
  try {
    const body = JSON.parse(text) as ApiErrorBody;
    if (body?.error?.code && typeof body.error.message === 'string') {
      return new ApiError(status, body.error.code, body.error.message);
    }
  } catch {
    return new ApiError(
      status,
      'invalid_response',
      `Request failed (${status})`,
    );
  }
  return new ApiError(status, 'invalid_response', `Request failed (${status})`);
}

export function userFacingMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return error.message;
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
}
