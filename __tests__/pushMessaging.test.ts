import {
  isFirebaseAppConfigured,
  notificationIdFromMessage,
  osPermissionStatus,
} from '../src/features/push/messaging';

describe('push messaging adapter', () => {
  it('reports unconfigured when Firebase apps are empty', async () => {
    expect(isFirebaseAppConfigured()).toBe(false);
    await expect(osPermissionStatus(null)).resolves.toBe('unconfigured');
  });

  it('does not treat arbitrary payload fields as destinations', () => {
    expect(
      notificationIdFromMessage({
        data: { screen: 'DirectChat', userId: 'x' },
      }),
    ).toBeNull();
  });
});
