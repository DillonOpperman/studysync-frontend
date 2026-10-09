type UuidCrypto = { randomUUID: () => string };

export function newClientMsgId(): string {
  const webCrypto = (globalThis as { crypto?: UuidCrypto }).crypto;
  if (!webCrypto?.randomUUID) {
    throw new Error('UUID generation is unavailable');
  }
  return webCrypto.randomUUID();
}
