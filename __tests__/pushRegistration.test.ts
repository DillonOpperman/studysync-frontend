import { ApiClient } from '../src/api/client';
import { createMemoryDeviceIdStore } from '../src/features/push/deviceStore';
import { isFirebaseAppConfigured } from '../src/features/push/messaging';
import {
  registerCurrentDevice,
  unregisterCurrentDevice,
} from '../src/features/push/registration';

function jsonResponse(status: number, body?: unknown): Response {
  if (status === 204) {
    return new Response(null, { status });
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function client(fetchImpl: typeof fetch) {
  return new ApiClient(
    {
      getAccessToken: () => 't',
      refreshAccessToken: async () => null,
      onAuthFailure: async () => undefined,
    },
    fetchImpl,
  );
}

describe('push registration (mocked Firebase)', () => {
  it('treats empty Firebase apps as unconfigured development mode', () => {
    expect(isFirebaseAppConfigured()).toBe(false);
  });

  it('registers the FCM token after an authenticated session exists', async () => {
    const store = createMemoryDeviceIdStore();
    let posted: unknown;
    const fetchImpl = jest.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        expect(String(input)).toContain('/push/devices');
        posted = JSON.parse(String(init?.body));
        return jsonResponse(201, {
          id: 'd1',
          platform: 'android',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          lastSeenAt: '2026-01-01T00:00:00Z',
        });
      },
    );
    const id = await registerCurrentDevice(
      client(fetchImpl as unknown as typeof fetch),
      store,
    );
    expect(id).toBe('d1');
    expect(await store.get()).toBe('d1');
    expect(posted).toEqual(
      expect.objectContaining({
        token: 'fcm-token-test-abcdefghijklmnopqrstuvwxyz',
        platform: expect.stringMatching(/^(android|ios)$/),
      }),
    );
  });

  it('unregisters the stored device on logout and clears local id', async () => {
    const store = createMemoryDeviceIdStore('d1');
    const fetchImpl = jest.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain('/push/devices/d1');
      return jsonResponse(204);
    });
    await unregisterCurrentDevice(
      client(fetchImpl as unknown as typeof fetch),
      store,
    );
    expect(await store.get()).toBeNull();
  });

  it('still clears the local device id when unregister returns 401', async () => {
    const store = createMemoryDeviceIdStore('d1');
    const fetchImpl = jest.fn(async () =>
      jsonResponse(401, {
        error: { code: 'unauthorized', message: 'authentication required' },
      }),
    );
    await unregisterCurrentDevice(
      client(fetchImpl as unknown as typeof fetch),
      store,
    );
    expect(await store.get()).toBeNull();
  });
});
