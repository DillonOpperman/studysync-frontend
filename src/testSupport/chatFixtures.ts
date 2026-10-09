import type { GroupMessageDto } from '../api/types';

export function chatMessage(
  overrides: Partial<GroupMessageDto> = {},
): GroupMessageDto {
  return {
    id: 'm1',
    groupId: 'g1',
    senderId: 'u1',
    clientMsgId: 'c1',
    content: 'Hello',
    messageType: 'text',
    createdAt: '2026-01-01T00:00:00.000Z',
    editedAt: null,
    deletedAt: null,
    reactions: [],
    attachments: [],
    ...overrides,
  };
}
