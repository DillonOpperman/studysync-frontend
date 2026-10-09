const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UuidCrypto = {
  randomUUID?: () => string;
  getRandomValues?: (array: Uint8Array) => Uint8Array;
};

function bytesToUuidV4(bytes: Uint8Array): string {
  /* UUID v4 version/variant bits. */
  /* eslint-disable no-bitwise */
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  /* eslint-enable no-bitwise */
  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
    12,
    16,
  )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function fillRandomBytes(bytes: Uint8Array): void {
  const webCrypto = (globalThis as { crypto?: UuidCrypto }).crypto;
  if (webCrypto?.getRandomValues) {
    webCrypto.getRandomValues(bytes);
    return;
  }
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
}

export function newClientMsgId(): string {
  const webCrypto = (globalThis as { crypto?: UuidCrypto }).crypto;
  if (typeof webCrypto?.randomUUID === 'function') {
    return webCrypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  fillRandomBytes(bytes);
  const id = bytesToUuidV4(bytes);
  if (!UUID_V4.test(id)) {
    throw new Error('UUID generation is unavailable');
  }
  return id;
}
