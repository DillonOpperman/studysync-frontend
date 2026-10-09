import type { GroupMessageDto, ReactionStateDto } from '../../api/types';

export type ClientOp =
  | { op: 'subscribe'; groupId: string }
  | { op: 'unsubscribe'; groupId: string }
  | {
      op: 'message.send';
      groupId: string;
      clientMsgId: string;
      content: string;
      messageType?: string;
      attachmentIds?: string[];
    }
  | { op: 'reaction.toggle'; messageId: string; emoji: string }
  | { op: 'message.edit'; messageId: string; content: string }
  | { op: 'message.delete'; messageId: string }
  | { op: 'ping'; ts: number };

export type ServerEvent =
  | { op: 'subscribed'; groupId: string }
  | { op: 'message.created'; payload: GroupMessageDto }
  | { op: 'message.edited'; payload: GroupMessageDto }
  | { op: 'message.deleted'; payload: GroupMessageDto }
  | { op: 'reaction.updated'; payload: ReactionStateDto }
  | { op: 'error'; code: string; message: string }
  | { op: 'pong'; ts: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseServerEvent(raw: string): ServerEvent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(parsed) || typeof parsed.op !== 'string') {
    return null;
  }
  switch (parsed.op) {
    case 'subscribed':
      return typeof parsed.groupId === 'string'
        ? { op: 'subscribed', groupId: parsed.groupId }
        : null;
    case 'message.created':
    case 'message.edited':
    case 'message.deleted':
      return isRecord(parsed.payload)
        ? { op: parsed.op, payload: parsed.payload as GroupMessageDto }
        : null;
    case 'reaction.updated':
      return isRecord(parsed.payload)
        ? {
            op: 'reaction.updated',
            payload: parsed.payload as ReactionStateDto,
          }
        : null;
    case 'error':
      return typeof parsed.code === 'string' &&
        typeof parsed.message === 'string'
        ? { op: 'error', code: parsed.code, message: parsed.message }
        : null;
    case 'pong':
      return typeof parsed.ts === 'number'
        ? { op: 'pong', ts: parsed.ts }
        : null;
    default:
      return null;
  }
}
