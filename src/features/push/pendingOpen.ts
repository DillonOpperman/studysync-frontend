let pendingId: string | null = null;
let lastHandled: { id: string; at: number } | null = null;

const DUP_MS = 4000;

export function stashNotificationId(id: string | null): void {
  if (!id) {
    return;
  }
  pendingId = id;
}

export function takePendingNotificationId(): string | null {
  const id = pendingId;
  pendingId = null;
  return id;
}

export function shouldHandleNotification(
  id: string,
  now = Date.now(),
): boolean {
  if (lastHandled && lastHandled.id === id && now - lastHandled.at < DUP_MS) {
    return false;
  }
  lastHandled = { id, at: now };
  return true;
}

export function resetPendingOpenForTests(): void {
  pendingId = null;
  lastHandled = null;
}
