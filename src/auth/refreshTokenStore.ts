import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.studysync.app.refresh';
const USERNAME = 'refresh';

export interface RefreshTokenStore {
  get(): Promise<string | null>;
  set(token: string): Promise<void>;
  clear(): Promise<void>;
}

export const keychainRefreshTokenStore: RefreshTokenStore = {
  async get() {
    const result = await Keychain.getGenericPassword({ service: SERVICE });
    if (!result) {
      return null;
    }
    return result.password || null;
  },
  async set(token: string) {
    await Keychain.setGenericPassword(USERNAME, token, {
      service: SERVICE,
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  },
  async clear() {
    await Keychain.resetGenericPassword({ service: SERVICE });
  },
};

export function createMemoryRefreshTokenStore(
  initial: string | null = null,
): RefreshTokenStore {
  let value = initial;
  return {
    async get() {
      return value;
    },
    async set(token: string) {
      value = token;
    },
    async clear() {
      value = null;
    },
  };
}
