import { newClientMsgId } from '../src/features/chat/clientMsgId';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('newClientMsgId', () => {
  it('returns a UUID even when crypto.randomUUID is missing', () => {
    const webCrypto = (
      globalThis as {
        crypto?: { randomUUID?: () => string };
      }
    ).crypto;
    if (!webCrypto) {
      throw new Error('expected global crypto');
    }
    const original = webCrypto.randomUUID;
    // Hermes on Android debug builds currently lacks randomUUID.
    Object.defineProperty(webCrypto, 'randomUUID', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    try {
      const id = newClientMsgId();
      expect(id).toMatch(UUID_V4);
      expect(newClientMsgId()).not.toBe(id);
    } finally {
      Object.defineProperty(webCrypto, 'randomUUID', {
        value: original,
        configurable: true,
        writable: true,
      });
    }
  });
});
