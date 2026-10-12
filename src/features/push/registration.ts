import type { ApiClient } from '../../api/client';
import { ApiError } from '../../api/errors';
import { keychainDeviceIdStore, type DeviceIdStore } from './deviceStore';
import { currentPlatform, loadMessaging } from './messaging';
import { pushApi } from './pushApi';

export async function registerCurrentDevice(
  client: ApiClient,
  store: DeviceIdStore = keychainDeviceIdStore,
): Promise<string | null> {
  const messaging = loadMessaging();
  if (!messaging) {
    return null;
  }
  let token: string;
  try {
    token = await messaging.getToken();
  } catch {
    return null;
  }
  if (!token || token.length < 32) {
    return null;
  }
  const device = await pushApi(client).registerDevice({
    platform: currentPlatform(),
    token,
    installationId: 'primary',
  });
  await store.set(device.id);
  return device.id;
}

export async function unregisterCurrentDevice(
  client: ApiClient,
  store: DeviceIdStore = keychainDeviceIdStore,
): Promise<void> {
  const id = await store.get();
  if (!id) {
    return;
  }
  try {
    await pushApi(client).unregisterDevice(id);
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }
  } finally {
    await store.clear();
  }
}
