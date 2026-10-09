import type { GroupMessageDto, ReactionStateDto } from '../../api/types';

export type ChatMessage = GroupMessageDto & {
  pending?: boolean;
  failed?: boolean;
};

export function sortMessages(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => {
    const t = a.createdAt.localeCompare(b.createdAt);
    if (t !== 0) {
      return t;
    }
    return a.id.localeCompare(b.id);
  });
}

export function upsertMessages(
  existing: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  const clientToId = new Map<string, string>();
  for (const message of existing) {
    byId.set(message.id, message);
    if (message.clientMsgId) {
      clientToId.set(message.clientMsgId, message.id);
    }
  }
  for (const next of incoming) {
    const previousId = clientToId.get(next.clientMsgId);
    if (previousId && previousId !== next.id) {
      const previous = byId.get(previousId);
      byId.delete(previousId);
      byId.set(next.id, {
        ...previous,
        ...next,
        pending: false,
        failed: false,
      });
      clientToId.set(next.clientMsgId, next.id);
      continue;
    }
    const current = byId.get(next.id);
    byId.set(next.id, {
      ...current,
      ...next,
      pending: next.pending ?? false,
      failed: next.failed ?? current?.failed ?? false,
    });
    if (next.clientMsgId) {
      clientToId.set(next.clientMsgId, next.id);
    }
  }
  return sortMessages([...byId.values()]);
}

export function applyReactionState(
  messages: ChatMessage[],
  state: ReactionStateDto,
): ChatMessage[] {
  return messages.map(message =>
    message.id === state.messageId
      ? { ...message, reactions: state.reactions }
      : message,
  );
}

export function newestId(messages: ChatMessage[]): string | null {
  const confirmed = messages.filter(message => !message.pending);
  return confirmed.length ? confirmed[confirmed.length - 1].id : null;
}

export function oldestId(messages: ChatMessage[]): string | null {
  const confirmed = messages.filter(message => !message.pending);
  return confirmed.length ? confirmed[0].id : null;
}

export function canEditMessage(
  message: ChatMessage,
  userId: string,
  nowMs = Date.now(),
): boolean {
  if (message.pending || message.deletedAt || message.senderId !== userId) {
    return false;
  }
  const created = Date.parse(message.createdAt);
  if (!Number.isFinite(created)) {
    return false;
  }
  return nowMs - created <= 15 * 60 * 1000;
}

export function canDeleteMessage(
  message: ChatMessage,
  userId: string,
  isLeader: boolean,
): boolean {
  if (message.pending || message.deletedAt) {
    return false;
  }
  return message.senderId === userId || isLeader;
}

export function validateOutgoingContent(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed) {
    return 'content is required';
  }
  if ([...trimmed].length > 4000) {
    return 'content must be at most 4000 characters';
  }
  return null;
}
