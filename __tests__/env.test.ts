import {
  API_PREFIX,
  apiUrl,
  authenticatedWsUrl,
  defaultApiBaseUrl,
  wsBaseUrl,
} from '../src/config/env';

describe('API configuration', () => {
  it('uses /api/v1 and never treats Android localhost as the host', () => {
    expect(API_PREFIX).toBe('/api/v1');
    expect(apiUrl('/me')).toMatch(/\/api\/v1\/me$/);
    const defaults = defaultApiBaseUrl();
    if (defaults.includes('10.0.2.2')) {
      expect(defaults).not.toContain('localhost');
      expect(defaults).not.toContain('127.0.0.1');
    }
  });

  it('builds a websocket path without embedding the token in the base URL', () => {
    expect(wsBaseUrl()).toMatch(/\/api\/v1\/ws$/);
    expect(wsBaseUrl()).toMatch(/^ws/);
    expect(wsBaseUrl()).not.toContain('access_token');
    expect(authenticatedWsUrl('secret.jwt')).toContain(
      'access_token=secret.jwt',
    );
  });
});
