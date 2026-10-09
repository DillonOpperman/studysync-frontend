const MAX_DELAY_MS = 30_000;
const MAX_ATTEMPTS_BEFORE_PAUSE = 12;

export function reconnectDelayMs(
  attempt: number,
  random = Math.random,
): number {
  const exp = Math.min(MAX_DELAY_MS, 1000 * 2 ** Math.max(0, attempt));
  const jitter = 0.5 + random();
  return Math.round(exp * jitter);
}

export function shouldPauseReconnect(attempt: number): boolean {
  return attempt >= MAX_ATTEMPTS_BEFORE_PAUSE;
}
