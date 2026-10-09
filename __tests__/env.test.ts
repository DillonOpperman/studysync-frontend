import { API_PREFIX, apiUrl, defaultApiBaseUrl } from '../src/config/env';

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
});
