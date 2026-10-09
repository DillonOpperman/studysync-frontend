import type { DirectMessageDto } from '../../api/types';

export function sortDirectMessages(
  messages: DirectMessageDto[],
): DirectMessageDto[] {
  return [...messages].sort((a, b) => {
    const time = a.createdAt.localeCompare(b.createdAt);
    if (time !== 0) {
      return time;
    }
    return a.id.localeCompare(b.id);
  });
}

export function upsertDirectMessages(
  existing: DirectMessageDto[],
  incoming: DirectMessageDto[],
): DirectMessageDto[] {
  const byId = new Map(existing.map(message => [message.id, message]));
  for (const next of incoming) {
    byId.set(next.id, next);
  }
  return sortDirectMessages([...byId.values()]);
}

export function oldestDirectId(messages: DirectMessageDto[]): string | null {
  return sortDirectMessages(messages)[0]?.id ?? null;
}
