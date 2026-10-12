import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.studysync.app.push-device';
const USERNAME = 'device';

export interface DeviceIdStore {
  get(): Promise<string | null>;
  set(id: string): Promise<void>;
  clear(): Promise<void>;
}

export const keychainDeviceIdStore: DeviceIdStore = {
  async get() {
    const result = await Keychain.getGenericPassword({ service: SERVICE });
    if (!result) {
      return null;
    }
    return result.password || null;
  },
  async set(id: string) {
    await Keychain.setGenericPassword(USERNAME, id, {
      service: SERVICE,
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  },
  async clear() {
    await Keychain.resetGenericPassword({ service: SERVICE });
  },
};

export function createMemoryDeviceIdStore(
  initial: string | null = null,
): DeviceIdStore {
  let value = initial;
  return {
    async get() {
      return value;
    },
    async set(id: string) {
      value = id;
    },
    async clear() {
      value = null;
    },
  };
}
